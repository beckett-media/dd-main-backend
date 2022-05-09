/**
 * Middleware that is used to catch all error
 * thrown by calling next(err) in routes
 */
const SimpleLogger = require("../utils/simpleLogger");
const { createResObject, errorResponse } = require("../utils/utilFunctions");
const { errorObjects } = require("../utils/errorObjects");
const mongoose = require("mongoose");

module.exports = function (err, req, res, next) {
  const errorKey = SimpleLogger.error(err);
  console.log("err--------------", err);

  if (err.name === "MongoError") {
    switch (err.code) {
      case 11000:
        return errorResponse(
          res,
          errorObjects.MONGO_DB_DUPLICATE_ERROR,
          err.message,
          400
        );
      default:
        return errorResponse(
          res,
          errorObjects.MONGO_DB_BASE_ERROR,
          err.message,
          400
        );
    }
  } else if (err instanceof mongoose.Error) {
    if (err instanceof mongoose.Error.ValidationError) {
      return errorResponse(
        res,
        errorObjects.MONGO_DB_VALIDATION_ERROR,
        err.message,
        400
      );
    } else {
      return errorResponse(
        res,
        errorObjects.MONGO_DB_BASE_ERROR,
        err.message,
        400
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
