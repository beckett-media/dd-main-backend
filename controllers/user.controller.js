const { userService } = require("../services");
const { createResObject } = require("../utils/utilFunctions");
const breakingLiveWebhook = require("../services/breakingLiveWebhook");

const updateUser = async (req, res) => {
  let oldProfilePic = req.user.profilePicture;
  const response = await userService.updateUser(req.user, req.body);
  if (response.isSuccess) {
    res
      .status(response.status || 200)
      .send(
        createResObject(
          response.isSuccess,
          { ...response.data },
          response.message
        )
      );
    if (oldProfilePic && req.body.hasOwnProperty("profilePicture")) {
      await userService.createJobForOldPicDeletion(oldProfilePic);
    }
    breakingLiveWebhook(response.data.user, req.headers);
  } else {
    res
      .status(response.status || 400)
      .send(
        createResObject(
          response.isSuccess,
          {},
          response.message,
          response.error || {}
        )
      );
  }
};

module.exports = {
  updateUser,
};
