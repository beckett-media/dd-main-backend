const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const path = require("path");
const fsPromises = require("fs").promises;
const SimpleLogger = require("../utils/simpleLogger");
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
    athleteName: {
      type: String,
    },
    cardName: {
      type: String,
    },
    cardYear: {
      type: Number,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: stringConstants.collectionNames.USER_COLLECTION,
    },
    status: {
      type: String,
      enum: [
        stringConstants.cardState.PENDING,
        stringConstants.cardState.SUBMITTED,
        stringConstants.cardState.GRADED,
      ],
      default: stringConstants.cardState.PENDING,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/**
 * Pre hook to clean card data
 */
cardSchema.pre("remove", function () {
  if (this.front) {
    try {
      await fsPromises.unlink(path.join(__dirname, "../public", this.front));
    } catch (error) {
      SimpleLogger.error(error);
      await new PendingDeletion({
        deletionType: stringConstants.deletionType.FILE,
        data: path.join(__dirname, "../public", this.front),
      }).save();
    }
  }

  if(this.back){
    try {
      await fsPromises.unlink(path.join(__dirname, "../public", this.back));
    } catch (error) {
      SimpleLogger.error(error);
      await new PendingDeletion({
        deletionType: stringConstants.deletionType.FILE,
        data: path.join(__dirname, "../public", this.back)
      }).save();
    }
  }

  if(this.video){
    try{
      await fsPromises.unlink(path.join(__dirname, "../public", this.video));
    }catch(error){
      SimpleLogger.error(error);
      await new PendingDeletion({
        deletionType: stringConstants.deletionType.FILE,
        data: path.join(__dirname, "../public", this.video)
      }).save();
    }
  }
});

const Card = mongoose.model(
  stringConstants.collectionNames.CARD_COLLECTION,
  cardSchema
);

module.exports.Card = Card;
