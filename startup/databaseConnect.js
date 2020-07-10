const mongoose = require("mongoose");
const config = require("config");
const SimpleLogger = require("../utils/simpleLogger");
const { stringConstants } = require("../utils/constants");

module.exports = () => {
  connectToDb();

  mongoose.connection.on("error", (err) => {
    SimpleLogger.error(`DB error ${err}`);
    connectToDb();
  });

  mongoose.connection.on("reconnect", (ref) => {
    SimpleLogger.info("DB reconnect try");
  });

  mongoose.connection.on("reconnected", (ref) => {
    SimpleLogger.info("DB reconnected");
  });

  mongoose.connection.on("disconnected", () => {
    SimpleLogger.info("DB disconnected");
    connectToDb();
  });
};

function connectToDb() {
  let dbConnectionString = config.get(stringConstants.DB_CONNECTION_STRING);
  if (process.env.NODE_ENV === "test") {
    dbConnectionString = "mongodb://localhost/snap_grade_test";
  }
  mongoose
    .connect(dbConnectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      SimpleLogger.info("Connected to database successfully");
      console.log("Connected to database successfully");
    })
    .catch((err) => {
      SimpleLogger.error(err, true);
    });
}
