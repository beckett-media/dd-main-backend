const multer = require("multer");
const path = require("path");
const { getRandomIntInclusive } = require("../utils/utilFunctions");

/**
 * Storage for user profile picture
 */
const profilePicStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const fileDestination = path.join(__dirname, "../public/profile_pictures");
    cb(null, fileDestination);
  },
  filename: function (req, file, cb) {
    const dateTime = Date.now();
    const extension = path.extname(file.originalname).toLowerCase();
    const rand = getRandomIntInclusive(100, 999);
    const fileName = `${dateTime}${rand}_profile_pic${extension}`;
    cb(null, fileName);
  },
});
/**
 * Storage for game card front
 */
const cardFrontStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const fileDestination = path.join(__dirname, "../public/card_fronts");
    cb(null, fileDestination);
  },
  filename: function (req, file, cb) {
    const dateTime = Date.now();
    const extension = path.extname(file.originalname).toLowerCase();
    const rand = getRandomIntInclusive(100, 999);
    const fileName = `${dateTime}${rand}_card_front${extension}`;
    cb(null, fileName);
  },
});
/**
 * Storage for game card back
 */
const cardBackStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const fileDestination = path.join(__dirname, "../public/card_backs");
    cb(null, fileDestination);
  },
  filename: function (req, file, cb) {
    const dateTime = Date.now();
    const extension = path.extname(file.originalname).toLowerCase();
    const rand = getRandomIntInclusive(100, 999);
    const fileName = `${dateTime}${rand}_card_back${extension}`;
    cb(null, fileName);
  },
});

/**
 * Storage to upload the video of the card
 */
const cardVideoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const fileDestination = path.join(__dirname, "../public/card_videos");
    cb(null, fileDestination);
  },
  fileName: function (req, file, cb) {
    const dateTime = Date.now();
    const extension = path.extname(file.originalname).toLowerCase();
    const rand = getRandomIntInclusive(100, 999);
    const fileName = `${dateTime}${rand}_card_video${extension}`;
    cb(null, fileName);
  },
});
/**
 * Multer function for upload profile picture
 */
module.exports.uploadProfilePic = multer({
  storage: profilePicStorage,
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext != ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg") {
      return cb(new Error("Not a valid file type"), false);
    }
    cb(null, true);
  },
}).single("profilePicture");
/**
 * Multer function for upload front of game card
 */
module.exports.uploadCardFront = multer({
  storage: cardFrontStorage,
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext != ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg") {
      return cb(new Error("Not a valid file type"), false);
    }
    cb(null, true);
  },
}).single("cardFront");
/**
 * Multer function for upload back of the card
 */
module.exports.uploadCardBack = multer({
  storage: cardBackStorage,
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg") {
      return cb(new Error("Not a valid file type"), false);
    }
    cb(null, true);
  },
}).single("cardBack");
/**
 * Multer function to upload short videos of the cards
 */
module.exports.uploadCardVideo = multer({
  storage: cardVideoStorage,
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (
      ext !== ".3gp" &&
      ext !== ".mp4" &&
      ext !== ".ts" &&
      ext !== ".webm" &&
      ext !== ".mkv"
    ) {
      return cb(new Error("Not a valid file type"), false);
    }
    cb(null, true);
  },
}).single("cardVideo");
