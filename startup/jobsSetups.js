const initJobs = require("../init/initJobs");

module.exports = async () => {
  if (process.env.NODE_ENV != "testing") {
    await initJobs();
  }
};
