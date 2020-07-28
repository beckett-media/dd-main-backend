const mongoose = require("mongoose");
const { stringConstants } = require("../utils/constants");

const questionSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      trim: true,
    },
    desc: {
      type: String,
      required: true,
      trim: true,
    },
    options: [
      {
        _id: { type: String, required: true, trim: true },
        name: { type: String, required: true, trim: true },
        points: { type: Number, required: true },
      },
    ],
    maxPoints: {
      type: Number,
      required: true,
    },
    minPoints: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Question = mongoose.model(
  stringConstants.collectionNames.QUESTIONS_COLLECTION,
  questionSchema
);

module.exports.Question = Question;
