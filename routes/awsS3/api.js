const express = require("express");
const router = express.Router();
const S3 = require("aws-sdk/clients/s3");
const auth = require("../../middlewares/authenticateUser");
const appAuth = require("../../middlewares/authenticateApp");
const { createResObject } = require("../../utils/utilFunctions");
const { stringConstants } = require("../../utils/constants");
const { errorObjects } = require("../../utils/errorObjects");

router.all("/", [], async (req, res) => {
  console.log("React S3");
  console.log(req.body);
  const s3 = new S3({
    region: "us-east-1",
    accessKeyId: "AKIA2UG7D5EPCSPKMPMB",
    secretAccessKey: "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",
    signatureVersion: "v4",
  });
  const s3Params = {
    Bucket: "dilly-uploads",
    Key: "req.body.fileName",
    Expires: 60 * 60,
    ContentType: "image/*",
  };
  console.log("1");
  const url = await getPresignUrlPromiseFunction(s3, s3Params);
  if (url)
    return res
      .status(200)
      .send(
        createResObject(
          true,
          { url },
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

function getPresignUrlPromiseFunction(s3, s3Params) {
  return new Promise(async (resolve, reject) => {
    try {
      await s3.getSignedUrl("putObject", s3Params, function (err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    } catch (error) {
      return reject(error);
    }
  });
}

module.exports = router;
