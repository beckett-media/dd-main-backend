const mongoose = require("mongoose");
const { stringConstants } = require("../../utils/constants");

const gradedCardSortListSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: stringConstants.collectionNames.USER_COLLECTION,
  },
  cards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: stringConstants.collectionNames.CARD_COLLECTION,
    },
  ],
});

const GradedCardSortList = mongoose.model(
  stringConstants.collectionNames.GRADED_CARD_SORT_LIST_COLLECTION,
  gradedCardSortListSchema
);

module.exports.GradedCardSortList = GradedCardSortList;
