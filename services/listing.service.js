const { Listing } = require("../models/listing");
const SimpleLogger = require("../utils/simpleLogger");

const performMongoDBSearch = async (query, limit = 5) => {
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
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 1,
          title: 1,
          brand: 1,
          cardType: 1,
          grade: 1,
          modelNo: 1,
          playerNames: 1,
          sport: 1,
          year: 1,
          price: 1,
          images: 1,
        },
      },
    ];

    return await Listing.aggregate(agg);
  } catch (error) {
    SimpleLogger.error(error);
    throw new Error(error.message);
  }
};

module.exports = {
  performMongoDBSearch,
};
