const mongoose = require("mongoose");
const mongoosastic = require("mongoosastic");

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
      lowercase: true,
      trim: true,
      unique: true,
      es_indexed: true,
    },
    email: {
      type: String,
      required: false,
      minlength: 5,
      maxlength: 70,
      trim: true,
      lowercase: true,
      es_indexed: true,
    },
    phoneNumber: {
      type: String,
      required: false,
      minlength: 5,
      maxlength: 15,
      trim: true,
      lowercase: true,
      es_indexed: true,
    },
    address: {
      type: String,
      required: false,
      minlength: 5,
      maxlength: 500,
      trim: true,
      lowercase: true,
      es_indexed: true,
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

storeSchema.plugin(mongoosastic, { hosts: ["localhost:9200"] });

const Store = mongoose.model(
  stringConstants.collectionNames.STORES_COLLECTION,
  storeSchema
);

module.exports.Store = Store;
