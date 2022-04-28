/**
 * Middleware that is used to catch all error
 * thrown by calling next(err) in routes
 */
const SimpleLogger = require("../utils/simpleLogger");
const { createResObject } = require("../utils/utilFunctions");
const { errorObjects } = require("../utils/errorObjects");
const mongoose = require("mongoose");

module.exports = function (err, req, res, next) {
  const errorKey = SimpleLogger.error(err);
  console.log("err--------------", err);

  if (err.name === "MongoError") {
    switch (err.code) {
      case 11000:
        return res
          .status(500)
          .send(
            createResObject(
              false,
              {},
              err.message,
              errorObjects.MONGO_DB_DUPLICATE_ERROR
            )
          );
      default:
        return res
          .status(500)
          .send(
            createResObject(
              false,
              {},
              err.message,
              errorObjects.MONGO_DB_BASE_ERROR
            )
          );
    }
  } else if (err instanceof mongoose.Error) {
    if (err instanceof mongoose.Error.ValidationError) {
      res
        .status(500)
        .send(
          createResObject(
            false,
            {},
            err.message,
            errorObjects.MONGO_DB_VALIDATION_ERROR
          )
        );
    } else {
      res
        .status(500)
        .send(
          createResObject(
            false,
            {},
            err.message,
            errorObjects.MONGO_DB_BASE_ERROR
          )
        );
    }
  } else {
    res
      .status(500)
      .send(
        createResObject(
          false,
          {},
          `Internal error, please contact Admin Error Key: ${errorKey}`,
          errorObjects.INTERNAL_SERVER_ERROR(
            `Internal error, please contact Admin Error Key: ${errorKey}`
          )
        )
      );
  }
};
