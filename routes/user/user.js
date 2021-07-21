const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const auth = require("../../middlewares/authenticateUser");
const appAuth = require("../../middlewares/authenticateApp");
const { uploadProfilePic } = require("../../middlewares/multerSingle");
const fs = require("fs");
const fsPromises = fs.promises;
const path = require("path");
const SimpleLogger = require("../../utils/simpleLogger");
const _ = require("lodash");
const { User } = require("../../models/user");
const { PendingDeletion } = require("../../models/pendingDeletion");
const {
  valRegisterRequest,
  valUsernameRequest,
  valChangePasswordRequest,
  valNewPasswordRequest,
  valVerifyOtp
} = require("../../middlewares/validation");
const { createResObject, generate } = require("../../utils/utilFunctions");
const { stringConstants } = require("../../utils/constants");
const { errorObjects } = require("../../utils/errorObjects");
const sendNotifications = require("../../utils/sendNotifications");
const sendMail = require('./../../handler/sendMail');
const config = require('config');

// Dev remove in production
const Joi = require("@hapi/joi");

/**
 * Register user with full name, email and password
 */

router.post(
  "/register-user",
  [appAuth, valRegisterRequest],
  async (req, res) => {
    const email = req.body.email.toLowerCase();
    const deviceToken = req.body.deviceToken;
    const osType = req.body.osType;

    let firstSignin = true;

    let user = await User.findOne({ email });

    if (user)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.USER_EMAIL_ALREADY_EXISTS,
            errorObjects.USER_EMAIL_ALREADY_EXISTS
          )
        );

    user = new User(_.pick(req.body, ["email", "password", "fullName"]));

    user.addDeviceToken(deviceToken);
    user.metadata.osType = osType;
    user.metadata.signupType = stringConstants.signupType.IN_APP;

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken.token;

    user = await user.save();

    res.header(stringConstants.AUTH_TOKEN_STRING, token.token);
    res.header(stringConstants.REFRESH_TOKEN_STRING, refreshToken.token);

    const returnObject = {
      ...user.getUserBasicInfo(),
      authTokenExpiry: token.expiry,
      refreshTokenExpiry: refreshToken.expiry,
      firstSignin,
    };

    return res.send(
      createResObject(
        true,
        { user: returnObject },
        stringConstants.USER_REGISTERATION_SUCCESSFUL
      )
    );
  }
);
/**
 * Post or update the already existing profile picture
 */

router.post(
  "/add-update-profile-picture",
  [appAuth, auth],
  async (req, res, next) => {
    const userId = req.user._id;
    let user = await User.findById(userId);

    uploadProfilePic(req, res, async function (err) {
      // Check if error, log error and send error response
      if (err) {
        SimpleLogger.error(err);
        // If file type error return relavent message
        if (err.message === stringConstants.NOT_A_VALID_FILE_TYPE) {
          return res
            .status(415)
            .send(
              createResObject(
                false,
                {},
                stringConstants.FILE_TYPE_NOT_ACCEPTED,
                errorObjects.FILE_TYPE_NOT_ACCEPTED
              )
            );
        }
        // Otherwise return 500
        return next(err);
      }
      // Check file exists
      if (!req.file)
        return res
          .status(400)
          .send(
            createResObject(
              false,
              {},
              stringConstants.NO_FILE_FOUND,
              errorObjects.NO_FILE_FOUND
            )
          );
      // Check file size if corrupt delete the uploaded file
      if (req.file.size <= 0) {
        const profilePicPath = path.join(
          __dirname,
          `../../public/${userId}/profile_pictures/`,
          `${req.file.filename}`
        );
        try {
          await fsPromises.unlink(profilePicPath);
        } catch (err) {
          SimpleLogger.error(err);
          await new PendingDeletion({
            deletionType: stringConstants.deletionType.FILE,
            data: profilePicPath,
          }).save();
        }
        return res
          .status(400)
          .send(
            createResObject(
              true,
              {},
              stringConstants.FILE_CORRUPTED,
              errorObjects.FILE_CORRUPTED
            )
          );
      }

      // Save the profile to user document and return user document
      // Before that check if profile picture already exists and replace if it does
      /*
      ** Since profile pic name is same everytime multer automatically replaces the existing
      ** picture
      if (user.profilePicture) {
        const absolutePath = path.join(
          __dirname,
          `../../public`,
          `${user.profilePicture}`
        );
        try {
          await fsPromises.unlink(absolutePath);
        } catch (err) {
          SimpleLogger.error(err);
          await new PendingDeletion({
            deletionType: stringConstants.deletionType.FILE,
            data: absolutePath,
          }).save();
        }
      }
      */

      const profilePicPath = path.join(
        `${userId}/profile_pictures/`,
        `${req.file.filename}`
      );
      user = await User.findByIdAndUpdate(
        userId,
        { $set: { profilePicture: profilePicPath } },
        { new: true }
      );
      user = user.getUserBasicInfo();
      return res.send(
        createResObject(true, { user }, stringConstants.UPDATE_SUCCESSFUL)
      );
    });
  }
);

router.post(
  "/add-update-username",
  [appAuth, auth, valUsernameRequest],
  async (req, res) => {
    const userId = req.user._id;
    const username = req.body.username.toLowerCase();
    let user = await User.findOne({ username: username });
    if (user)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.USERNAME_ALREADY_TAKEN,
            errorObjects.USERNAME_ALREADY_TAKEN
          )
        );
    user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .send(
          createResObject(
            false,
            {},
            stringConstants.USER_ID_DOEST_NOT_EXISTS,
            errorObjects.USER_ID_DOEST_NOT_EXISTS
          )
        );
    user.username = username;
    user.isComplete = user.isBasicInfoCompleted();
    user = await user.save();

    user = user.getUserBasicInfo();
    return res.send(
      createResObject(true, { user }, stringConstants.UPDATE_SUCCESSFUL)
    );
  }
);

/**
 * Route to change password
 */
router.post(
  "/change-password",
  [appAuth, valChangePasswordRequest, auth],
  async (req, res) => {
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const userId = req.user._id;

    let user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .send(
          createResObject(
            false,
            {},
            stringConstants.USER_ID_DOEST_NOT_EXISTS,
            errorObjects.USER_ID_DOEST_NOT_EXISTS
          )
        );
    // TODO check if ebay user. If ebay return
    const valid = await bcrypt.compare(oldPassword, user.password);
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

    const salt = await bcrypt.genSalt(10);
    const encrypterNewPass = await bcrypt.hash(newPassword, salt);

    user = await User.findByIdAndUpdate(
      userId,
      { $set: { password: encrypterNewPass } },
      { new: true }
    );

    return res.send(
      createResObject(
        true,
        { user },
        stringConstants.PASSWORD_UPDATED_SUCCESSFULLY
      )
    );
  }
);

/**
 * Route to get notification setting
 */
router.get("/notification-settings", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user)
    return res
      .status(404)
      .send(
        createResObject(
          false,
          {},
          stringConstants.USER_ID_DOEST_NOT_EXISTS,
          errorObjects.USER_ID_DOEST_NOT_EXISTS
        )
      );

  return res.send(
    createResObject(
      true,
      { notifications: user.settings.notifications },
      stringConstants.FETCH_SUCESSFUL
    )
  );
});

/**
 * Route to toggle notification settings
 */
router.post(
  "/toggle-notification-settings",
  [appAuth, auth],
  async (req, res) => {
    const userId = req.user._id;
    let user = await User.findById(userId);

    const currentStatus = user.settings.notifications;

    user = await User.findByIdAndUpdate(
      userId,
      { $set: { "settings.notifications": !currentStatus } },
      { new: true }
    );

    return res.send(
      createResObject(
        true,
        { notifications: user.settings.notifications },
        stringConstants.UPDATE_SUCCESSFUL
      )
    );
  }
);

/**
 * GET route to fetch user details including settins
 */
router.get("/user-details", [appAuth, auth], async (req, res) => {
  const user = await User.findById(req.user._id);

  const userDetails = user.getUserDetails();

  return res.send(
    createResObject(
      true,
      { user: userDetails },
      stringConstants.FETCH_SUCESSFUL
    )
  );
});

/**
 * Delete user route only for dev purposes will be removed
 * in productions
 * TODO: Remove route in production
 */
router.delete("/delete-user", async (req, res) => {
  const schema = Joi.object({
    emails: Joi.array().items(Joi.string().email()).required(),
  });

  const { error } = schema.validate(req.body);
  if (error)
    return res.send(createResObject(false, {}, error.details[0].message));
  if (req.body.emails.length < 1)
    return res.send(createResObject(false, {}, "email array cannot be empty"));
  const emails = req.body.emails;
  const userArray = [];
  for (const email of emails) {
    const user = await User.findOne({ email });
    if (user) {
      await user.remove();
      userArray.push(user);
    }
  }
  return res.send(
    createResObject(true, {}, `${userArray.length} user deleted`)
  );
});

/**
 * GET user subscription
 */
router.get("/user-subscription", [appAuth, auth], async (req, res) => {
  const user = await User.findById(req.user._id);
  const { subscription = {} } = user;
  const { cardsLeft = 0, subId = '' } = subscription;
  const skipPayment = config.get('skipPayment');

  return res.send(
    createResObject(
      true,
      { cardsLeft: skipPayment ? '9999999' : cardsLeft, subId: skipPayment ? 'sub_high' :  subId},
      stringConstants.FETCH_SUCESSFUL
    )
  );
});

/**
 * GET cancel user subscription
 */
router.get("/cancel-subscription", [appAuth, auth], async (req, res) => {
  const user = await User.findById(req.user._id);
  const { subscription = {} } = user;
  const { subId = '' } = subscription;
  if (subId) {
    const userId = req.user._id;
    let user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          subscription: {
            subId: '',
            cardsLeft: '0'
          }
        }
      }
    );
    return res.send(
      createResObject(
        true,
        { user },
        'Subscription Cancelled'
      )
    );
  }
  return res.send(createResObject(false, {}, 'No Subscription taken'));
});

router.get("/authorize", [appAuth, auth], async (req, res) => {
  // const user = await User.findById(req.user._id);
  return res.send(
    createResObject(
      true,
      {},
      'Authorized User'
    )
  );
});

/**
 * Generate OTP
 */
router.post(
  "/generate-otp",
  [appAuth],
  async (req, res) => {
    const email = req.body.email;

    let user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.USER_EMAIL_NOT_FOUND,
            errorObjects.USER_EMAIL_NOT_FOUND
          )
        );

    const otp = generate(6);

    user = await User.findOneAndUpdate(
      { email },
      { $set: { otp, isOTPVerified: false } }
    );

    const mail = await sendMail({
      email, subject: 'OTP for Forgot Password',
      text: `Your forgot password OTP is ${otp}`
    });

    const { success = false } = mail;
    if (success) {
      return res.send(
        createResObject(
          true,
          stringConstants.OTP_GENERATED
        )
      );
    }

    return res.send(
      createResObject(
        false,
        stringConstants.OTP_GENERATE_ISSUE,
        errorObjects.OTP_GENERATE_ISSUE
      )
    );
  }
);

/**
 * Verify OTP
 */
router.post(
  "/verify-otp",
  [appAuth, valVerifyOtp],
  async (req, res) => {
    const otp = req.body.otp;
    const email = req.body.email;

    let user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.USER_EMAIL_NOT_FOUND,
            errorObjects.USER_EMAIL_NOT_FOUND
          )
        );

    const { otp: dbOtp = 0 } = user;
    if (dbOtp) {
      if (dbOtp === Number(otp)) {
        user = await User.findOneAndUpdate(
          { email },
          { $set: { otp: 0, isOTPVerified: true } }
        );
      } else {
        return res
        .status(500)
        .send(
          createResObject(
            false,
            {},
            stringConstants.INVALID_OTP,
            errorObjects.INVALID_OTP
          )
        );
      }
    } else {
      return res
        .status(500)
        .send(
          createResObject(
            false,
            {},
            stringConstants.NO_OTP,
            errorObjects.NO_OTP
          )
        );
    }

    return res.send(
      createResObject(
        true,
        stringConstants.VERIFY_OTP
      )
    );
  }
);

/**
 * Change user password
 */
router.post(
  "/new-password",
  [appAuth, valNewPasswordRequest],
  async (req, res) => {
    const newPassword = req.body.newPassword;
    const email = req.body.email;

    let user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.USER_EMAIL_NOT_FOUND,
            errorObjects.USER_EMAIL_NOT_FOUND
          )
        );

    const { isOTPVerified = false } = user;
    if (!isOTPVerified) {
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.OTP_NOT_VERIFIED,
            errorObjects.OTP_NOT_VERIFIED
          )
        );
    }

    const salt = await bcrypt.genSalt(10);
    const encrypterNewPass = await bcrypt.hash(newPassword, salt);

    user = await User.findOneAndUpdate(
      { email },
      { $set: { password: encrypterNewPass, isOTPVerified: false } }
    );

    return res.send(
      createResObject(
        true,
        stringConstants.PASSWORD_UPDATED_SUCCESSFULLY
      )
    );
  }
);

module.exports = router;
