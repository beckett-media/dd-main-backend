/**
 * There will be multiple transcation log document to keep track of a
 * single transaction. Each transaction log document will have different
 * status based on the state of transaction. It is a good choice to
 * make this a capped collection.
 */

const mongoose = require("mongoose");
const { stringConstants } = require("../utils/constants");
/**
 * Transaction log to keep track of transaction
 * It should have:
 * 1. transaction ID
 * 2. time created and update or timestamps
 * 3. current status
 * 4. piID or stripe payment intent ID
 * 5. User for tracking purposes
 */
const transactionLogSchema = new mongoose.Schema({
  transaction: {
    type: mongoose.Types.ObjectId,
    ref: stringConstants.collectionNames.TRANSACTION_COLLECTION,
  },
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
      stringConstants.transactionStatus.CANCELLED,
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
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const TransactionLog = mongoose.model(
  stringConstants.collectionNames.TRANSACTION_LOG_COLLECTION,
  transactionLogSchema
);

module.exports.TransactionLog = TransactionLog;
