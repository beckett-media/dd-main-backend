const { Store } = require("../models/store");
const SimpleLogger = require("../utils/simpleLogger");

/**
 * Async and await conversion of function
 */
function searchAsAyncAwait(query) {
  return new Promise((resolve, reject) => {
    Store.search({ query_string: { query } }, function (err, confirmation) {
      if (err) return reject(err);
      return resolve(confirmation);
    });
  });
}

const performElasticSearch = async (query) => {
  try {
    return await searchAsAyncAwait(query);
  } catch (error) {
    SimpleLogger.error(error);
    throw new Error(error.message);
  }
};

module.exports = {
  performElasticSearch,
};
