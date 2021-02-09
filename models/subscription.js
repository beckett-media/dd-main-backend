const mongoose = require("mongoose");
const { stringConstants } = require("../utils/constants");

const subscriptionSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      trim: true
    },
    plans: [
      {
        _id: { type: String, required: true, trim: true },
        price: { type: String, required: true, trim: true },
        detail: { type: String, required: true, trim: true },
        cards: { type: Number, required: true }
      }
    ]
  },
  { timestamps: true }
);

const Subscription = mongoose.model(
  stringConstants.collectionNames.SUBSCRIPTION_COLLECTION,
  subscriptionSchema
);

module.exports.Subscription = Subscription;
