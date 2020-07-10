const SimpleLogger = require("../utils/simpleLogger");

module.exports = () => {
  SimpleLogger.info("Initializing error handling.");

  process.addListener("uncaughtException", (err) => {
    console.error(err);
    SimpleLogger.error(err, true);
  });

  process.addListener("unhandledRejection", (err) => {
    console.error(err);
    SimpleLogger.error(err, true);
  });
};
