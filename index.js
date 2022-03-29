const express = require("express");
const app = express();
const configEnv = require("config");
require("./startup/corsSetup")(app);
var Rollbar = require("rollbar");
const path = require("path");
const errorMid = require("./middlewares/errorHandler");
require("./startup/directoryCreator")();
const { bidding } = require("./controllers/bidding.controller");
const { stringConstants } = require("./utils/constants");

/**
 * Async error handler, so you don't have to use try
 * and catch all the time
 */
require("express-async-errors");
/**
 * Set all the environment variables before start
 */

require("dotenv").config({ path: path.join(__dirname, "../.env") });
/**
 * Connect to DB
 * and add starting data
 */
require("./startup/databaseConnect")();
require("./startup/databaseSetup")();
/**
 * Setup simple logger before we can use it.
 * Create all required directory first
 */

const SimpleLogger = require("./utils/simpleLogger");
const { config } = require("dotenv");
SimpleLogger.initializeLogs("SnapGrade.log"); // Set the root log file name

/**
 * Error handler to handle all async errors
 */
require("./startup/errorHandler");

/**
 * Initialize firebase for notifcations
 */
require("./startup/initFirebase")();
/**
 * User startup files to intiate app
 */
require("./startup/envVariableCheck")();
require("./startup/expressSetup")(app);
require("./startup/routeSetup")(app);
require("./startup/jobsSetups")();

// Rollbar integrated for error reporting
var rollbar = new Rollbar({
  accessToken: configEnv.get(stringConstants.ROLL_BAR_ACCESS_TOKEN),
  captureUncaught: true,
  captureUnhandledRejections: true,
});

app.use(rollbar.errorHandler());
app.use(errorMid);

const server = require("./startup/startServer")(app);
bidding(server);
module.exports = server;
