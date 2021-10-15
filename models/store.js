const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { stringConstants } = require("../utils/constants");

const storeSchema = new mongoose.Schema(
  {
    logo: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    images: { type: [String], default: [], required: false },
    desc: {
      type: String,
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: stringConstants.collectionNames.USER_COLLECTION,
      required: false,
    },
  },
  { timestamps: true, toJSON: { getters: true } }
);

const Store = mongoose.model(
  stringConstants.collectionNames.STORES_COLLECTION,
  storeSchema
);

module.exports.Store = Store;
