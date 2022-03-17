const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { stringConstants } = require("../utils/constants");

const promoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    promoCode: {
      type: String,
      uppercase: true,
      unique: true,
      required: true,
      trim: true,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 90,
    },
    listing: {
      type: Array,
      default: [],
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

promoSchema.methods.toJSON = function () {
  const promo = this;
  const promoObject = promo.toObject();

  delete promoObject.enabled;
  delete promoObject.isDeleted;

  return promoObject;
};

const Promo = mongoose.model(
  stringConstants.collectionNames.PROMO_COLLECTION,
  promoSchema
);

module.exports.Promo = Promo;
