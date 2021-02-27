const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const path = require("path");
const fsPromises = require("fs").promises;
const SimpleLogger = require("../utils/simpleLogger");
const rimraf = require("rimraf");
const _ = require("lodash");
const { PendingDeletion } = require("./pendingDeletion");
const { stringConstants } = require("../utils/constants");

const cardSchema = new mongoose.Schema(
  {
    front: {
      type: String,
    },
    back: {
      type: String,
    },
    video: {
      type: String,
    },
    thumbnail: {
      type: String,
    },
    gradedImage: {
      type: String,
    },
    year: {
      type: Number,
      min: 1000,
      max: 9999,
    },
    brand: {
      type: String,
    },
    cardNumber: {
      type: Number,
    },
    playerNames: [{ type: String }],
    user: {
      type: Schema.Types.ObjectId,
      ref: stringConstants.collectionNames.USER_COLLECTION,
      required: true,
    },
    status: {
      type: String,
      enum: [
        stringConstants.cardState.PENDING,
        stringConstants.cardState.PAID,
        stringConstants.cardState.GRADED,
      ],
      default: stringConstants.cardState.PENDING,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    grading: {
      centering: { type: String },
      corners: { type: Object }
    },
  },
  { timestamps: true, toJSON: { getters: true } }
);
/**
 * Static method to check if card complete
 */
cardSchema.methods.checkIfCompleted = function () {
  return (
    !!this.front &&
    !!this.back &&
    !!this.year &&
    !!this.brand &&
    !!this.cardNumber &&
    !!this.playerNames.length > 0
  );
};
/**
 * Method to return card details
 */
cardSchema.methods.getCardDetails = function () {
  const id = this._id || null;
  const front = this.front || null;
  const back = this.back || null;
  const video = this.video || null;
  const thumbnail = this.thumbnail || null;
  const gradedImage = this.gradedImage || null;
  const year = this.year || null;
  const brand = this.brand || null;
  const cardNumber = this.cardNumber || null;
  const playerNames = this.playerNames || null;
  const createdAt = this.createdAt || null;
  const updatedAt = this.updatedAt || null;

  return {
    id,
    front,
    back,
    video,
    thumbnail,
    gradedImage,
    year,
    brand,
    cardNumber,
    playerNames,
    createdAt,
    updatedAt,
  };
};
/**
 * Schema method to return card details with grading
 */
cardSchema.methods.getCardDetailsWithGrading = function () {
  const id = this._id || null;
  const front = this.front || null;
  const back = this.back || null;
  const video = this.video || null;
  const thumbnail = this.thumbnail || null;
  const gradedImage = this.gradedImage || null;
  const year = this.year || null;
  const brand = this.brand || null;
  const cardNumber = this.cardNumber || null;
  const playerNames = this.playerNames || null;
  const status = this.status || null;
  const grading = gradingEmpty(this.grading) ? null : this.grading;
  const createdAt = this.createdAt || null;
  const updatedAt = this.updatedAt || null;

  return {
    id,
    front,
    back,
    video,
    thumbnail,
    gradedImage,
    year,
    brand,
    cardNumber,
    playerNames,
    grading,
    status,
    createdAt,
    updatedAt,
  };
};
/**
 * Pre hook to clean card data
 */
cardSchema.pre("remove", async function () {
  const cardDir = path.join(
    __dirname,
    "../public",
    `${this.user}`,
    "cards",
    `${this._id}/`
  );
  try {
    rimraf.sync(cardDir);
  } catch (error) {
    SimpleLogger.error(error);
    await new PendingDeletion({
      deletionType: stringConstants.deletionType.DIR,
      data: cardDir,
    }).save();
  }
});

const Card = mongoose.model(
  stringConstants.collectionNames.CARD_COLLECTION,
  cardSchema
);

function gradingEmpty(grading) {
  return (
    !grading.centering &&
    !grading.corners
  );
}

module.exports.Card = Card;
