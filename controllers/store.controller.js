const { storeService } = require("../services");
const { createResObject } = require("../utils/utilFunctions");
const { stringConstants } = require("../utils/constants");

const performMongoDBSearch = async (req, res) => {
  try {
    const totalStores = await storeService.performMongoDBSearch(
      req.query.search
    );
    return res.send(
      createResObject(
        true,
        { stores: totalStores },
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
