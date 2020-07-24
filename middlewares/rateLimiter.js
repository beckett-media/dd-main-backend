/**
 * All the middleware for limiting requests to an end point
 */
const RateLimit = require("express-rate-limit");
const MongoStore = require("rate-limit-mongo");
const config = require("config");
const SimpleLogger = require("../utils/simpleLogger");
const { stringConstants } = require("../utils/constants");
const { errorObjects } = require("../utils/errorObjects");
const { createResObject } = require("../utils/utilFunctions");

let dbConnectionString = config.get(stringConstants.DB_CONNECTION_STRING);
if (process.env.NODE_ENV === "test") {
  dbConnectionString = "mongodb://localhost/snap_grade_test";
}

module.exports.globalLimiter = new RateLimit({
  store: new MongoStore({
    uri: dbConnectionString,
    collectionName: stringConstants.collectionNames.GLOBAL_REQ_RATE_RECORDS,
    errorHandler: (err) => {
      SimpleLogger.error(err);
    },
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: createResObject(
    false,
    {},
    stringConstants.TOO_MANY_REQUESTS,
    errorObjects.TOO_MANY_REQUESTS
  ),
});

module.exports.wrongSigninLimiter = new RateLimit({
  store: new MongoStore({
    uri: dbConnectionString,
    collectionName: stringConstants.collectionNames.WRONG_SIGNIN_REQ_RECORDS,
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  skipSuccessfulRequests: true,
  message: createResObject(
    false,
    {},
    stringConstants.TOO_MANY_REQUESTS,
    errorObjects.TOO_MANY_REQUESTS
  ),
});
