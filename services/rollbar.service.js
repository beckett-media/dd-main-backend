var Rollbar = require("rollbar");
const config = require("config");

const { stringConstants } = require("../utils/constants");
const SimpleLogger = require("../utils/simpleLogger");

// Rollbar integrated for error reporting
var rollbar = new Rollbar({
  accessToken: config.get(stringConstants.ROLL_BAR_ACCESS_TOKEN),
  captureUncaught: true,
  captureUnhandledRejections: true,
});

const logHandledErrorAsCritical = (message) => {
  SimpleLogger.error(message);
  rollbar.critical(message);
};

const logHandledErrorAsError = (message) => {
  SimpleLogger.error(message);
  rollbar.error(message);
};

module.exports = {
  logHandledErrorAsCritical,
  logHandledErrorAsError,
};
