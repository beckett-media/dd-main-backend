const { Store } = require("../models/store");
const SimpleLogger = require("../utils/simpleLogger");

const performMongoDBSearch = async (query) => {
  try {
    agg = [
      {
        $search: {
          wildcard: {
            query: `*${query}*`,
            path: {
              wildcard: "*",
            },
            allowAnalyzedField: true,
          },
        },
      },
      { $limit: Integer.parseInt(limit) },
      {
        $project: {
          _id: 1,
          title: 1,
          email: 1,
          phoneNumber: 1,
          address: 1,
          images: 1,
        },
      },
    ];
    return await Store.aggregate(agg);
  } catch (error) {
    SimpleLogger.error(error);
    throw new Error(error.message);
  }
};

module.exports = {
  performMongoDBSearch,
};
