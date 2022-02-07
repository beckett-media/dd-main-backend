const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { stringConstants } = require("../utils/constants");

const AuctionSchema = new mongoose.Schema(
  {
    listing: {
      type: Schema.Types.ObjectId,
      ref: stringConstants.collectionNames.Listing_COLLECTION,
      required: true,
    },
    bidStart: {
      type: Date,
      default: Date.now,
    },
    bidEnd: {
      type: Date,
      required: true,
    },
    seller: {
      type: mongoose.Schema.ObjectId,
      ref: stringConstants.collectionNames.USER_COLLECTION,
      required: true,
    },
    startingBid: { type: Number, default: 0 },
    bids: [
      {
        bidder: {
          type: mongoose.Schema.ObjectId,
          ref: stringConstants.collectionNames.USER_COLLECTION,
          required: true,
        },
        bidAmount: { type: Number, required: true },
        time: Date,
      },
    ],
  },
  { timestamps: true, toJSON: { getters: true } }
);

const Auction = mongoose.model(
  stringConstants.collectionNames.AUCTION_COLLECTION,
  AuctionSchema
);

module.exports.Auction = Auction;
