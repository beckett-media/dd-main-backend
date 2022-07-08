const { User } = require("../models/user");
const { stringConstants } = require("../utils/constants");
const { errorObjects } = require("../utils/errorObjects");
const { PendingDeletion } = require("../models/pendingDeletion");
const SimpleLogger = require("../utils/simpleLogger");

const isUserNameExist = async (username) => {
  let user = await User.findOne({ username });
  if (user) {
    return true;
  }
  return false;
};

/**
 * Update user
 * @param {ObjectId} user
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUser = async (user, updateBody) => {
  if (updateBody.username) {
    if (await isUserNameExist(updateBody.username))
      return {
        isSuccess: false,
        status: 400,
        message: stringConstants.USERNAME_ALREADY_TAKEN,
        error: errorObjects.USERNAME_ALREADY_TAKEN,
      };
  }

  if (user.profilePicture === updateBody.profilePicture) {
    return {
      isSuccess: false,
      status: 400,
      message: stringConstants.OLD_PROFILE_PIC_MATCH,
      error: errorObjects.OLD_PROFILE_PIC_MATCH,
    };
  }

  Object.assign(user, updateBody);
  await user.save();

  return {
    isSuccess: true,
    status: 200,
    message: stringConstants.UPDATE_SUCCESSFUL,
    data: {
      user: user.getUserBasicInfo(),
    }
  };
};

const createJobForOldPicDeletion = async (profilePictureUrl) => {
  try {
    if (profilePictureUrl) {
      await PendingDeletion.create({
        deletionType: stringConstants.deletionType.S3_WEB,
        data: `${profilePictureUrl}`,
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
};

module.exports = {
  updateUser,
  createJobForOldPicDeletion,
};
