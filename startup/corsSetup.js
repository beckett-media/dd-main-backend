const cors = require("cors");
const { stringConstants } = require("../utils/constants");

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
  exposedHeaders: [
    stringConstants.AUTH_TOKEN_STRING,
    stringConstants.REFRESH_TOKEN_STRING,
    stringConstants.headerNames.RETRY_AFTER,
    stringConstants.headerNames.X_RATELIMIT_LIMIT,
    stringConstants.headerNames.X_RATELIMIT_REMAINING,
  ],
  allowedHeaders: [
    stringConstants.APP_TOKEN_STRING,
    stringConstants.AUTH_TOKEN_STRING,
    stringConstants.REFRESH_TOKEN_STRING,
    "Accept",
    "Content-Type",
  ],
};

module.exports = (app) => {
  app.use(cors(corsOptions));
};
