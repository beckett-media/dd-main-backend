const { listingService } = require("../services");
const { createResObject } = require("../utils/utilFunctions");
const { stringConstants } = require("../utils/constants");

const performMongoDBSearch = async (req, res) => {
  try {
    const totalListings = await listingService.performMongoDBSearch(
      req.query.search,
      req.query.limit
    );

    return res.send(
      createResObject(
        true,
        { listings: totalListings },
        stringConstants.FETCH_SUCESSFUL
      )
    );
  } catch (error) {
    return res.status(400).send(createResObject(false, {}, error.message));
  }
};

module.exports = {
  performMongoDBSearch,
};
