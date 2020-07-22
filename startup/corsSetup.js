const cors = require("cors");
const { stringConstants } = require("../utils/constants");

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
  exposedHeaders: [
    stringConstants.AUTH_TOKEN_STRING,
    stringConstants.REFRESH_TOKEN_STRING,
  ],
  allowedHeaders: [
    stringConstants.AUTH_TOKEN_STRING,
    stringConstants.REFRESH_TOKEN_STRING,
    "Accept",
    "Content-Type",
  ],
};

module.exports = (app) => {
  app.use(cors(corsOptions));
};
