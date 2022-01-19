const express = require("express");
const router = express.Router();
const S3 = require("aws-sdk/clients/s3");
const auth = require("../../middlewares/authenticateUser");
const appAuth = require("../../middlewares/authenticateApp");
const { createResObject } = require("../../utils/utilFunctions");
const { stringConstants } = require("../../utils/constants");
const { errorObjects } = require("../../utils/errorObjects");
const config = require("config");

const s3 = new S3({
  region: config.get(stringConstants.awsS3.S3_BUCKET_REGION),
  accessKeyId: config.get(stringConstants.awsS3.S3_WEB_ACCESS_KEY_ID),
  secretAccessKey: config.get(stringConstants.awsS3.S3_WEB_SECRET_ASCCESS_KEY),
  signatureVersion: config.get(stringConstants.awsS3.S3_WEB_SIGNATURE_VERSION),
});

router.all("/profile-picture", [appAuth, auth], (req, res) => {
  const post = s3.createPresignedPost({
    Bucket: "dilly-uploads",
    Fields: {
      key: `${stringConstants.awsS3.S3_PROFILE_PIC_UPLOAD}/${req.user._id}`,
      ContentType: req.body.fileType,
    },
    Expires: 60, // seconds
    Conditions: [
      ["content-length-range", 0, 2048576], // up to 2 MB
    ],
  });
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
