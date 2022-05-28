const mongoose = require("mongoose");
const { stringConstants } = require("../../utils/constants");

const collectionCardSortListSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: stringConstants.collectionNames.USER_COLLECTION,
    index: true
  },
  cards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: stringConstants.collectionNames.CARD_COLLECTION,
    },
  ],
});

const CollectionCardSortList = mongoose.model(
  stringConstants.collectionNames.COLLECTION_SORT_LIST_COLLECTION,
  collectionCardSortListSchema
);

module.exports.CollectionCardSortList = CollectionCardSortList;
