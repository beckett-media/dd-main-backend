const SimpleLogger = require("../utils/simpleLogger");
const config = require("config");
const { stringConstants } = require("../utils/constants");

module.exports = () => {
  try {
    // Check if able to fetch env variables
    config.get(stringConstants.STRIPE_TEST_KEY);
    config.get(stringConstants.JWT_PRIATE_KEY);
    config.get(stringConstants.JWT_REFRESH_KEY);
    config.get(stringConstants.JWT_APP_KEY);
    config.get(stringConstants.GOOGLE_APPLICATION_CREDENTIALS);
    config.get(stringConstants.DB_CONNECTION_STRING);
    config.get(stringConstants.EBAY_CLIENT_ID);
    config.get(stringConstants.EBAY_CLIENT_SECRET);
    config.get(stringConstants.ebayUrlNames.EBAY_O_AUTH);
    config.get(stringConstants.ebayUrlNames.EBAY_GET_USER);
    config.get(stringConstants.URLS.qrBaseUrl);
  } catch (ex) {
    SimpleLogger.error(ex, true);
  }
};
