const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const _ = require("lodash");
const Joi = require("@hapi/joi");
const got = require("got");
const config = require("config");
const fs = require("fs");
const SimpleLogger = require("../../utils/simpleLogger");
const appAuth = require("../../middlewares/authenticateApp");
const auth = require("../../middlewares/authenticateUser");
const authAppleTokenMiddleware = require("../../middlewares/authenticateAppleToken");
const { User } = require("../../models/user");
const { stringConstants } = require("../../utils/constants");
const { errorObjects } = require("../../utils/errorObjects");
const { createResObject } = require("../../utils/utilFunctions");
const {
  valSignInRequest,
  valSignInWithEbay,
  valSignOutReq,
} = require("../../middlewares/validation");
const { wrongSigninLimiter } = require("../../middlewares/rateLimiter");

router.post(
  "/sign-in-user",
  [appAuth, wrongSigninLimiter, valSignInRequest],
  async (req, res) => {
    const email = req.body.email.toLowerCase();
    const deviceToken = req.body.deviceToken;
    const osType = req.body.osType;
    let firstSignin = false;
    let user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .send(
          createResObject(
            false,
            {},
            stringConstants.USER_EMAIL_NOT_FOUND,
            errorObjects.USER_EMAIL_NOT_FOUND
          )
        );

    const role = user.role;

    if (role !== stringConstants.role.USER || role !== user.role) {
      //   Forbidden resource
      return res
        .status(403)
        .send(
          createResObject(
            false,
            {},
            stringConstants.FORBIDDEN_RESOURCE,
            errorObjects.FORBIDDEN_RESOURCE
          )
        );
    }

    if (!user.password)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.USER_ALREADY_SIGNED_UP_WITH_DIFFERENT_METHOD,
            errorObjects.USER_ALREADY_SIGNED_UP_WITH_DIFFERENT_METHOD(
              user.metadata.signupType
            )
          )
        );

    const isValid = await bcrypt.compare(req.body.password, user.password);
    if (!isValid)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.INCORRECT_PASSWORD,
            errorObjects.INCORRECT_PASSWORD
          )
        );

    const authToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    res.header(stringConstants.AUTH_TOKEN_STRING, authToken.token);
    res.header(stringConstants.REFRESH_TOKEN_STRING, refreshToken.token);

    user.refreshToken = refreshToken.token;
    user.metadata.osType = osType;
    user.addDeviceToken(deviceToken);
    user = await user.save();

    const returnObject = {
      ...user.getUserBasicInfo(),
      authTokenExpiry: authToken.expiry,
      refreshTokenExpiry: refreshToken.expiry,
      firstSignin,
    };

    return res.send(
      createResObject(
        true,
        { user: returnObject },
        stringConstants.SIGN_IN_SUCCESSFUL
      )
    );
  }
);

/**
 * Route to sign in user using Apple ID
 */
router.post(
  "/sign-in-with-apple",
  [wrongSigninLimiter, appAuth, authAppleTokenMiddleware],
  async (req, res, next) => {
    const email = req.payload.email;
    const userIdentifier = req.payload.sub;
    const deviceToken = req.body.deviceToken;
    const osType = req.body.osType;

    let user,
      schema,
      firstSignin = false;

    if (!email) {
      return next(new Error("Apple sign in email not found in payload"));
    } else if (!userIdentifier) {
      return next(
        new Error("Apple sign in user identifier not found in payload")
      );
    }

    user = await User.findOne({ email });
    if (user && user.metadata.signupType !== stringConstants.signupType.APPLE) {
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.USER_ALREADY_SIGNED_UP_WITH_DIFFERENT_METHOD,
            errorObjects.USER_ALREADY_SIGNED_UP_WITH_DIFFERENT_METHOD(
              user.metadata.signupType
            )
          )
        );
    }

    if (!user) {
      firstSignin = true;
      // Create a new user
      schema = Joi.object({
        fullName: Joi.string().required().min(2).max(255),
        userIdentifier: Joi.string().required(), // Already checked in middleware
        osType: Joi.string()
          .valid(
            stringConstants.osType.ANDROID,
            stringConstants.osType.iOS,
            stringConstants.osType.LINUX,
            stringConstants.osType.MAC_OS,
            stringConstants.osType.WINDOWS
          )
          .required(),
        deviceToken: Joi.string().required(),
      });

      const { error } = schema.validate(req.body);
      if (error)
        return res
          .status(400)
          .send(
            createResObject(
              false,
              {},
              stringConstants.REQUEST_VALIDATION_FAILED,
              errorObjects.REQUEST_VALIDATION_ERROR(error.details[0].message)
            )
          );

      const salt = await bcrypt.genSalt(10);
      const appleId = await bcrypt.hash(userIdentifier, salt);

      const fullName = req.body.fullName;
      user = new User({
        fullName: fullName,
        email: email,
        appleId: appleId,
        "metadata.signupType": stringConstants.signupType.APPLE,
      });
    } else {
      const role = user.role;
      // Cannot use this route for admin login
      if (role !== stringConstants.role.USER || role !== user.role) {
        //   Forbidden resource
        return res
          .status(403)
          .send(
            createResObject(
              false,
              {},
              stringConstants.FORBIDDEN_RESOURCE,
              errorObjects.FORBIDDEN_RESOURCE
            )
          );
      }
      schema = Joi.object({
        fullName: Joi.string(),
        userIdentifier: Joi.string().required(), // Already checked in middleware
        osType: Joi.string()
          .valid(
            stringConstants.osType.ANDROID,
            stringConstants.osType.iOS,
            stringConstants.osType.LINUX,
            stringConstants.osType.MAC_OS,
            stringConstants.osType.WINDOWS
          )
          .required(),
        deviceToken: Joi.string().required(),
      });

      const { error } = schema.validate(req.body);
      if (error) {
        return res
          .status(400)
          .send(
            createResObject(
              false,
              {},
              stringConstants.REQUEST_VALIDATION_FAILED,
              errorObjects.REQUEST_VALIDATION_ERROR(error.details[0].message)
            )
          );
      }

      const isValid = await bcrypt.compare(
        req.body.userIdentifier,
        user.appleId ? user.appleId : "default"
      );

      if (!isValid) {
        return res
          .status(400)
          .send(
            createResObject(
              false,
              {},
              stringConstants.APPLE_ID_DOES_NOT_MATCH_EMAIL,
              errorObjects.APPLE_ID_DOES_NOT_MATCH_EMAIL
            )
          );
      }
    }

    const authToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    res.header(stringConstants.AUTH_TOKEN_STRING, authToken.token);
    res.header(stringConstants.REFRESH_TOKEN_STRING, refreshToken.token);

    user.refreshToken = refreshToken.token;
    user.metadata.osType = osType;
    user.addDeviceToken(deviceToken);
    user = await user.save();

    const returnObject = {
      ...user.getUserBasicInfo(),
      authTokenExpiry: authToken.expiry,
      refreshTokenExpiry: refreshToken.expiry,
      firstSignin,
    };

    return res.send(
      createResObject(
        true,
        { user: returnObject },
        stringConstants.SIGN_IN_SUCCESSFUL
      )
    );
  }
);

/**
 * Sign in with ebay
 */
router.post(
  "/sign-in-with-ebay",
  [wrongSigninLimiter, appAuth, valSignInWithEbay],
  async (req, res) => {
    const accessToken = req.header(stringConstants.EBAY_ACCESS_TOKEN);
    const reqFullName = req.body.fullName;
    const reqEmail = req.body.email;
    const accountType = req.body.accountType;
    const osType = req.body.osType;
    const deviceToken = req.body.deviceToken;
    let firstSignin = false;

    const authorizationHeader = `Bearer ${accessToken}`;

    try {
      const { body } = await got(
        config.get(stringConstants.ebayUrlNames.EBAY_GET_USER),
        {
          headers: {
            Authorization: authorizationHeader,
          },
          responseType: "json",
        }
      );

      switch (accountType) {
        case stringConstants.ebayAccType.BUSINESS_ACCOUNT:
          if (
            reqFullName !== body.businessAccount.name ||
            reqEmail !== body.businessAccount.email
          ) {
            SimpleLogger.error(new Error("Name or email do not match token"));
            return res
              .status(401)
              .send(
                createResObject(
                  false,
                  {},
                  stringConstants.INVALID_OR_TOKEN_EXPIRED,
                  errorObjects.INVALID_OR_TOKEN_EXPIRED
                )
              );
          }
          break;
        case stringConstants.ebayAccType.INDIVIDUAL_ACCOUNT:
          const fullName = `${body.individualAccount.firstName} ${body.individualAccount.lastName}`;
          if (
            reqFullName !== fullName ||
            reqEmail !== body.individualAccount.email
          ) {
            SimpleLogger.error(new Error("Name or email do not match token"));
            return res
              .status(401)
              .send(
                createResObject(
                  false,
                  {},
                  stringConstants.INVALID_OR_TOKEN_EXPIRED,
                  errorObjects.INVALID_OR_TOKEN_EXPIRED
                )
              );
          }
          break;

        default:
          // Should never reach this as validation will already be done by Joi
          break;
      }
    } catch (error) {
      SimpleLogger.error(error);
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.UNSUSPECTED_ERROR,
            errorObjects.UNSUSPECTED_ERROR(error.message)
          )
        );
    }

    // All checks completed register the user

    // Check if user already exists in the system
    let user = await User.findOne({ email: reqEmail });

    // Check if email already exists but sign up type is not ebay
    if (user && user.metadata.signupType !== stringConstants.signupType.EBAY) {
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.USER_ALREADY_SIGNED_UP_WITH_DIFFERENT_METHOD,
            errorObjects.USER_ALREADY_SIGNED_UP_WITH_DIFFERENT_METHOD(
              user.metadata.signupType
            )
          )
        );
    }
    // Else proceed with registering or signig user in
    if (!user) {
      firstSignin = true;
      user = new User({
        fullName: reqFullName,
        email: reqEmail,
        "metadata.osType": osType,
        "metadata.signupType": stringConstants.signupType.EBAY,
      });
    } else {
      const role = user.role;

      if (role !== stringConstants.role.USER || role !== user.role) {
        //   Forbidden resource
        return res
          .status(403)
          .send(
            createResObject(
              false,
              {},
              stringConstants.FORBIDDEN_RESOURCE,
              errorObjects.FORBIDDEN_RESOURCE
            )
          );
      }
    }

    const authToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    res.header(stringConstants.AUTH_TOKEN_STRING, authToken.token);
    res.header(stringConstants.REFRESH_TOKEN_STRING, refreshToken.token);

    user.refreshToken = refreshToken.token;
    user.metadata.osType = osType;
    user.addDeviceToken(deviceToken);
    user = await user.save();

    const returnObject = {
      ...user.getUserBasicInfo(),
      authTokenExpiry: authToken.expiry,
      refreshTokenExpiry: refreshToken.expiry,
      firstSignin,
    };

    return res.send(
      createResObject(
        true,
        { user: returnObject },
        stringConstants.SIGN_IN_SUCCESSFUL
      )
    );
  }
);

router.post("/sign-out", [appAuth, auth, valSignOutReq], async (req, res) => {
  const deviceToken = req.body.deviceToken;
  const userId = req.user._id;

  let user = await User.findById(userId);
  // User exists or not will be checked in auth middleware
  user.removeToken(deviceToken);

  user = await user.save();

  user = user.getUserBasicInfo();

  return res.send(
    createResObject(true, { user }, stringConstants.SIGNED_OUT_SUCCESSFULLY)
  );
});
module.exports = router;
