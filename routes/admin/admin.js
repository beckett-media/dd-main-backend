const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const authAdmin = require("../../middlewares/authenticateAdmin");
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
  valVerifyOtp,
} = require("../../middlewares/validation");
const { createResObject, generate } = require("../../utils/utilFunctions");
const { stringConstants } = require("../../utils/constants");
const { errorObjects } = require("../../utils/errorObjects");
const sendNotifications = require("../../utils/sendNotifications");
const sendMail = require("./../../handler/sendMail");
const config = require("config");
const stripe = require("stripe")(config.get(stringConstants.STRIPE_TEST_KEY));

// Dev remove in production
const Joi = require("@hapi/joi");
const { StripeConnect } = require("../../models/stripeConnect");
const mongoose = require("mongoose");

/**
 * GET route to fetch user details including settins
 */
router.get("/admin-details", [authAdmin], async (req, res) => {
  const user = await User.findById(req.user._id);
  const userConnect = await StripeConnect.findOne({
    user: user._id,
  });
  let userDetails = user.getUserDetails();
  userDetails.stripeUserId =
    userConnect !== null ? userConnect.stripeUserId : "";
  return res.send(
    createResObject(
      true,
      { user: userDetails },
      stringConstants.FETCH_SUCESSFUL
    )
  );
});

/**
 * Post or update the already existing profile picture
 */

router.post(
  "/add-update-profile-picture",
  [appAuth, authAdmin],
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

      /**
       * Since all profile pictures for a particular User
       * have the same name. Multer will automatically
       * replace the existing profile picture.
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

module.exports = router;
