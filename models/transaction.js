/**
 * Transcation will be used in conjunction with transcation log
 * to keep track of transcations.
 *
 * There will be single transaction document for one single transaction
 * in the system whose status will be updated according to the
 * flow of transcation.
 */

const mongoose = require("mongoose");
const { stringConstants } = require("../utils/constants");

const transactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: stringConstants.currency.USD,
    },
    status: {
      type: String,
      enum: [
        stringConstants.transactionStatus.CREATED,
        stringConstants.transactionStatus.CANCELED,
        stringConstants.transactionStatus.SUCCEEDED,
        stringConstants.transactionStatus.ERROR,
        stringConstants.transactionStatus.REFUNDED,
      ],
    },
    piId: {
      type: String,
      trim: true,
    },
    desc: {
      type: String,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: stringConstants.collectionNames.USER_COLLECTION,
      required: true,
    },
    cards: [
      {
        type: mongoose.Types.ObjectId,
        ref: stringConstants.collectionNames.CARD_COLLECTION,
      },
    ],
  },
  { timestamps: true }
);

const Transaction = mongoose.model(
  stringConstants.collectionNames.TRANSACTION_COLLECTION,
  transactionSchema
);

module.exports.Transaction = Transaction;
