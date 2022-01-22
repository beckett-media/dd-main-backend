const config = require("config");
const S3 = require("aws-sdk/clients/s3");
const SimpleLogger = require("../utils/simpleLogger");
const { stringConstants } = require("../utils/constants");

const s3 = new S3({
  region: config.get(stringConstants.awsS3.S3_BUCKET_REGION),
  accessKeyId: config.get(stringConstants.awsS3.S3_WEB_ACCESS_KEY_ID),
  secretAccessKey: config.get(stringConstants.awsS3.S3_WEB_SECRET_ASCCESS_KEY),
  signatureVersion: config.get(stringConstants.awsS3.S3_WEB_SIGNATURE_VERSION),
});

const deleteFileFromS3Bucket = (docToRemove) => {
  s3.deleteObject(
    {
      Bucket: config.get(stringConstants.awsS3.S3_BUCKET_NAME),
      Key: docToRemove.data,
    },
    async function (err, _data) {
      if (err) {
        SimpleLogger.error(
          `Not able to delete from AWS wih key: ${docToRemove.data} with error ${err}`
        );
      } else {
        SimpleLogger.info(`Deleted aws entry with key: ${docToRemove.data}`);
        await docToRemove.remove();
      }
    }
  );
};

const createS3PostUrl = (fileType, fileExtension, userId) =>
  s3.createPresignedPost({
    Bucket: config.get(stringConstants.awsS3.S3_BUCKET_NAME),
    Fields: {
      key: `${
        stringConstants.awsS3.S3_PROFILE_PIC_UPLOAD
      }/${userId}_${Date.now()}.${fileExtension}`,
      ContentType: fileType,
    },
    Expires: 60, // seconds
    Conditions: [
      ["content-length-range", 0, 2048576], // up to 2 MB
    ],
  });

module.exports = {
  deleteFileFromS3Bucket,
  createS3PostUrl,
};
