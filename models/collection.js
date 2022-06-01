const mongoose = require("mongoose");
const { removeCardFromCollectionSortedList } = require("../services/dragDropSort/collectionCardSortList.service");
const Schema = mongoose.Schema;
const { stringConstants } = require("../utils/constants");

const collectionSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: stringConstants.collectionNames.USER_COLLECTION,
      required: true
    },
    card: {
      type: Schema.Types.ObjectId,
      ref: stringConstants.collectionNames.CARD_COLLECTION,
      required: true
    },
  },
  { timestamps: true, toJSON: { getters: true } }
);

const Collection = mongoose.model(
  stringConstants.collectionNames.MY_COLLECTION,
  collectionSchema
);

module.exports.Collection = Collection;
