/**
 * Simple logger middleware to log request and details in development
 */
const SimpleLogger = require("../utils/simpleLogger");
const _ = require("lodash");

module.exports = function (req, res, next) {
  SimpleLogger.info("*** Request Meta data ****");
  SimpleLogger.info(req.method);
  getUserAgentInfo(req.useragent);
  if (process.env.NODE_ENV.toLowerCase() !== "production") {
    if (req.body && !_.isEmpty(req.body))
      SimpleLogger.info(JSON.stringify(req.body));
    if (req.params && !_.isEmpty(req.params))
      SimpleLogger.info(JSON.stringify(req.params));
  }

  SimpleLogger.info(req.protocol, req.hostname, req.originalUrl);
  return next();
};

function getUserAgentInfo(useragent) {
  for (const property in useragent) {
    if (
      typeof useragent[property] === "boolean" &&
      useragent[property] !== false
    ) {
      SimpleLogger.info(`${property}: ${useragent[property]}`);
    } else if (typeof useragent[property] === "string") {
      SimpleLogger.info(`${property}: ${useragent[property]}`);
    }
  }
}
