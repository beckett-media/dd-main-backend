const mongoose = require("mongoose");
const { stringConstants } = require("../utils/constants");

const blogPressSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    bannerImage: {
      type: Buffer,
      required: false,
    },
    data: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["blog", "press"],
      required: true,
    },
  },
  { timestamps: true, toJSON: { getters: true } }
);

const BLOG_PRESS = mongoose.model(
  stringConstants.collectionNames.BLOG_PRESS_COLLECTION,
  blogPressSchema
);

module.exports.BLOG_PRESS = BLOG_PRESS;
