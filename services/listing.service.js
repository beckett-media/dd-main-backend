const { Listing } = require("../models/listing");
const SimpleLogger = require("../utils/simpleLogger");

/**
 * Async and await conversion of function
 */
function searchAsAyncAwait(query, limit) {
  return new Promise((resolve, reject) => {
    Listing.search(
      {
        query_string: { query: query.match(/^-?\d+$/) ? query : `*${query}*` },
      },
      {
        size: limit,
        hydrate: true,
        hydrateOptions: {
          select: "title images year grade price product playerNames brand",
        },
      },
      function (err, confirmation) {
        if (err) return reject(err);
        return resolve(confirmation);
      }
    );
  });
}

const performElasticSearch = async (query, limit = 5) => {
  try {
    return await searchAsAyncAwait(query, limit);
  } catch (error) {
    SimpleLogger.error(error);
    throw new Error(error.message);
  }
};

module.exports = {
  performElasticSearch,
};
