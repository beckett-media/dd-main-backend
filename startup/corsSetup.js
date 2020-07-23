const cors = require("cors");
const { stringConstants } = require("../utils/constants");

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
  exposedHeaders: ["x-app-token", "x-auth-token"],
  allowedHeaders: ["x-app-token", "x-auth-token", "Accept", "Content-Type"],
};

module.exports = (app) => {
  app.use(cors(corsOptions));
};
