const express = require("express");
const app = express();
const path = require("path");
const errorMid = require("./middlewares/errorHandler");
require("./startup/directoryCreator")();
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
 */
require("./startup/databaseConnect")();
/**
 * Setup simple logger before we can use it.
 * Create all required directory first
 */

const SimpleLogger = require("./utils/simpleLogger");
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
require("./startup/corsSetup")(app);
require("./startup/expressSetup")(app);
require("./startup/routeSetup")(app);
require("./startup/jobsSetups")();

app.use(errorMid);

const server = require("./startup/startServer")(app);

module.exports = server;
