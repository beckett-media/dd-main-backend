const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const _ = require("lodash");
const Joi = require("@hapi/joi");
const authAppleTokenMiddleware = require("../middlewares/authenticateAppleToken");
const { User } = require("../models/user");
const { stringConstants } = require("../utils/constants");
const { errorObjects } = require("../utils/errorObjects");
const { createResObject } = require("../utils/utilFunctions");
const { valSignInRequest } = require("../middlewares/validation");

router.post("/sign-in-user", valSignInRequest, async (req, res) => {
  const email = req.body.email.toLowerCase();
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

  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid)
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
  user = await user.save();

  const returnObject = {
    ...user.getUserBasicInfo(),
    authTokenExpiry: authToken.expiry,
    refreshTokenExpiry: refreshToken.expiry,
  };

  return res.send(
    createResObject(
      true,
      { user: returnObject },
      stringConstants.SIGN_IN_SUCCESSFUL
    )
  );
});

/**
 * Route to sign in user using Apple ID
 */
router.post(
  "/sign-in-with-apple",
  authAppleTokenMiddleware,
  async (req, res, next) => {
    const email = req.payload.email;
    const userIdetifier = req.payload.sub;

    let user, schema;

    if (!email) {
      return next(new Error("Apple sign in email not found in payload"));
    } else if (!userIdetifier) {
      return next(
        new Error("Apple sign in user identifier not found in payload")
      );
    }

    user = await User.findOne({ email });
    if (!user) {
      // Create a new user
      schema = Joi.object({
        fullName: Joi.string().required().min(2).max(255),
        userIdetifier: Joi.string().required(), // Already checked in middleware
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
      const appleId = await bcrypt.hash(userIdetifier, salt);

      const fullName = req.body.fullName;
      user = new User({
        fullName: fullName,
        email: email,
        appleId: appleId,
      });

      user.metadata.signupType = stringConstants.signUpType.APPLE;

      user = await user.save();
    } else {
      schema = Joi.object({
        fullName: Joi.string(),
        userIdetifier: Joi.string().required(), // Already checked in middleware
      });

      const { error } = schema.validate(req.body);
      if (err) {
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
        req.body.userIdetifier,
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
    user = await user.save();

    const returnObject = {
      ...user.getUserBasicInfo(),
      authTokenExpiry: authToken.expiry,
      refreshTokenExpiry: refreshToken.expiry,
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
module.exports = router;
