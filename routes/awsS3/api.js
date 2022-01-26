const express = require("express");
const router = express.Router();
const config = require("config");
const S3 = require("aws-sdk/clients/s3");
const auth = require("../../middlewares/authenticateUser");
const appAuth = require("../../middlewares/authenticateApp");
const { createResObject } = require("../../utils/utilFunctions");
const { stringConstants } = require("../../utils/constants");
const { errorObjects } = require("../../utils/errorObjects");
const { awsS3Service } = require("../../services/");

router.all("/profile-picture", [appAuth, auth], (req, res) => {
  const post = awsS3Service.createS3PostUrl(
    req.body.fileType,
    req.body.fileExtension,
    req.user._id
  );
  if (post)
    return res
      .status(200)
      .send(
        createResObject(
          true,
          { post },
          stringConstants.AWS_S3_PRE_SIGNED_URL_CREATED,
          errorObjects.AWS_S3_PRE_SIGNED_URL_CREATED
        )
      );
  else
    return res
      .status(404)
      .send(
        createResObject(
          false,
          {},
          stringConstants.AWS_S3_PRE_SIGNED_NOT_CREATED,
          errorObjects.AWS_S3_PRE_SIGNED_NOT_CREATED
        )
      );
});

module.exports = router;
