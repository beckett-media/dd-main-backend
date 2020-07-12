const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const auth = require("../middlewares/authenticateRequest");
const { uploadProfilePic } = require("../middlewares/multerSingle");
const fs = require("fs");
const fsPromises = fs.promises;
const path = require("path");
const SimpleLogger = require("../utils/simpleLogger");
const _ = require("lodash");
const { User } = require("../models/user");
const { PendingDeletion } = require("../models/pendingDeletion");
const {
  valRegisterRequest,
  valUsernameRequest,
  valChangePasswordRequest,
} = require("../middlewares/validation");
const { createResObject } = require("../utils/utilFunctions");
const { stringConstants } = require("../utils/constants");
const { errorObjects } = require("../utils/errorObjects");
const config = require("config");
const stripe = require("stripe")(config.get(stringConstants.STRIPE_TEST_KEY));

// Dev remove in production
const Joi = require("@hapi/joi");

/**
 * Register user with full name, email and password
 */

router.post("/register-user", valRegisterRequest, async (req, res) => {
  const email = req.body.email.toLowerCase();
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

  try {
    const customer = await stripe.customers.create({
      email: email,
      metadata: {
        userId: user._id.toString(),
      },
    });

    user.stripeId = customer.id;
  } catch (err) {
    SimpleLogger.error(err);
    return res
      .status(400)
      .send(
        createResObject(
          false,
          {},
          stringConstants.UNSUSPECTED_ERROR,
          errorObjects.UNSUSPECTED_ERROR(err.message)
        )
      );
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken.token;

  // Create folder for user, user cards
  const userDir = path.join(__dirname, "../public", user._id.toString());
  const exists = fs.existsSync(user);
  if (!exists) await fsPromises.mkdir(userDir);

  user = await user.save();

  res.header(stringConstants.AUTH_TOKEN_STRING, token.token);
  res.header(stringConstants.REFRESH_TOKEN_STRING, refreshToken.token);

  const returnObject = {
    ..._.pick(user, ["_id", "fullName", "email", "profilePicture", "username"]),
    authTokenExpiry: token.expiry,
    refreshTokenExpiry: refreshToken.expiry,
  };

  return res.send(
    createResObject(
      true,
      { user: returnObject },
      stringConstants.USER_REGISTERATION_SUCCESSFUL
    )
  );
});

/**
 * Post or update the already existing profile picture
 */

router.post("/add-update-profile-picture", auth, async (req, res, next) => {
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
        `../public/${userId}/profile_pictures/`,
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
    if (user.profilePicture) {
      const absolutePath = path.join(
        __dirname,
        `../public`,
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

    user.profilePicture = path.join(
      `${userId}/profile_pictures/`,
      `${req.file.filename}`
    );
    user = await user.save();
    user = _.pick(user, [
      "_id",
      "fullName",
      "email",
      "profilePicture",
      "username",
    ]);
    return res.send(
      createResObject(true, { user }, stringConstants.UPDATE_SUCCESSFUL)
    );
  });
});

router.post(
  "/add-update-username",
  [auth, valUsernameRequest],
  async (req, res) => {
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

    user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { username: username } },
      { new: true }
    );
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

    user = _.pick(user, [
      "_id",
      "fullName",
      "email",
      "profilePicture",
      "username",
    ]);
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
  [valChangePasswordRequest, auth],
  async (req, res) => {
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;

    let user = await User.findById(req.user._id);
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
    user.password = await bcrypt.hash(newPassword, salt);

    user = await user.save();
    user = _.pick(user, [
      "_id",
      "fullName",
      "email",
      "profilePicture",
      "username",
    ]);

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
router.post("/toggle-notification-settings", auth, async (req, res) => {
  let user = await User.findById(req.user._id);

  user.settings.notifications = !user.settings.notifications;
  user = await user.save();

  return res.send(
    createResObject(
      true,
      { notifications: user.settings.notifications },
      stringConstants.UPDATE_SUCCESSFUL
    )
  );
});

/**
 * GET route to fetch user details including settins
 */
router.get("/user-details", auth, async (req, res) => {
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
module.exports = router;
