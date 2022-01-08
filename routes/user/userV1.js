const express = require('express');
const router = express.Router();
const authAdminOrUser = require('../../middlewares/authenticateAdminOrUser');
const appAuth = require('../../middlewares/authenticateApp');
const { User } = require('../../models/user');
const { createResObject } = require('../../utils/utilFunctions');
const { stringConstants } = require('../../utils/constants');
const { errorObjects } = require('../../utils/errorObjects');
const config = require('config');

/**
 * Post or update the already existing profile picture
*/

router.post(
    '/add-update-profile-picture',
    [appAuth, authAdminOrUser],
    async (req, res, next) => {
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
        const clientS3Path = config.get('clientS3Path');
        user = await User.findByIdAndUpdate(
            userId,
            { $set: { profilePicture: `${clientS3Path}${imageUrl}` } },
            { new: true }
          );
          user = user.getUserBasicInfo();
          return res.send(
            createResObject(true, { user }, stringConstants.UPDATE_SUCCESSFUL)
          );
    }
);

module.exports = router;
