const express = require("express");
const router = express.Router();
const authAdminOrUser = require("../../middlewares/authenticateAdminOrUser");
const appAuth = require("../../middlewares/authenticateApp");
const { User } = require("../../models/user");
const { PendingDeletion } = require("../../models/pendingDeletion");
const { createResObject } = require("../../utils/utilFunctions");
const { stringConstants } = require("../../utils/constants");
const { errorObjects } = require("../../utils/errorObjects");
const SimpleLogger = require("../../utils/simpleLogger");

/**
 * Post or update the already existing profile picture
 */

router.post(
  "/add-update-profile-picture",
  [appAuth, authAdminOrUser],
  async (req, res, _next) => {
    const userId = req.user._id;
    const imageUrl = req.body.imageUrl;
    let user = await User.findById(userId);

    if (!user) {
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.USER_ID_DOEST_NOT_EXISTS,
            errorObjects.USER_ID_DOEST_NOT_EXISTS
          )
        );
    }

    if (!imageUrl) {
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
    }
    user = await User.findByIdAndUpdate(
      userId,
      { $set: { profilePicture: imageUrl } },
      { new: true }
    );
    user = user.getUserBasicInfo();

    try {
      if (req.user.profilePicture) {
        await PendingDeletion.create({
          deletionType: stringConstants.deletionType.S3_WEB,
          data: `${req.user.profilePicture}`,
        });
        SimpleLogger.info("Created job for old profile pic deletion");
      } else {
        SimpleLogger.info("No previous image found to create job for removing");
      }
    } catch (error) {
      SimpleLogger.error(
        "Not able to create job for old profile pic deletion" + error
      );
    }

    return res.send(
      createResObject(true, { user }, stringConstants.UPDATE_SUCCESSFUL)
    );
  }
);

module.exports = router;
