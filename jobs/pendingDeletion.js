/**
 * Job will try complete the pending deletions
 */
const { stringConstants } = require("../utils/constants");
const { PendingDeletion } = require("../models/pendingDeletion");
const SimpleLogger = require("../utils/simpleLogger");
const fs = require("fs");
const fsPromises = fs.promises;
const rimraf = require("rimraf");
const S3 = require("aws-sdk/clients/s3");
const { awsS3Service } = require("../services/");

module.exports = async () => {
  SimpleLogger.info(
    `Starting Job: ${stringConstants.jobType.PENDING_DELETION}`
  );
  const pendingDeletions = await PendingDeletion.find({});

  for (const pendingDeletion of pendingDeletions) {
    try {
      switch (pendingDeletion.deletionType) {
        case stringConstants.deletionType.FILE:
          await fsPromises.unlink(pendingDeletion.data);
          break;
        case stringConstants.deletionType.S3_WEB:
          awsS3Service.deleteFileFromS3Bucket(pendingDeletion);
          break;
        case stringConstants.deletionType.DIR:
          rimraf.sync(pendingDeletion.data);
          break;
        default:
          SimpleLogger.error(
            new Error(stringConstants.PENDING_DELETION_TYPE_NOT_HANDLED)
          );
          break;
      }
    } catch (error) {
      SimpleLogger.error(
        `${stringConstants.jobType.PENDING_DELETION} Error: ${error.message}`
      );
    }
  }
  SimpleLogger.info(
    `Finished Job: ${stringConstants.jobType.PENDING_DELETION}`
  );
};
