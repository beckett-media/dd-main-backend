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
        stringConstants.piStatus.CANCELED,
        stringConstants.piStatus.PROCESSING,
        stringConstants.piStatus.REQ_ACTION,
        stringConstants.piStatus.REQ_CAPTURE,
        stringConstants.piStatus.REQ_CONFIRMATION,
        stringConstants.piStatus.REQ_PM_METHOD,
        stringConstants.piStatus.SUCCEEDED,
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
