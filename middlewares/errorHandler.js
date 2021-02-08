/**
 * Middleware that is used to catch all error
 * thrown by calling next(err) in routes
 */
const SimpleLogger = require("../utils/simpleLogger");
const { createResObject } = require("../utils/utilFunctions");
const { errorObjects } = require("../utils/errorObjects");

module.exports = function (err, req, res, next) {
  const errorKey = SimpleLogger.error(err);
  console.log('err--------------', err);
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
};
