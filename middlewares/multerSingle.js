const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { getRandomIntInclusive } = require("../utils/utilFunctions");
const { stringConstants } = require("../utils/constants");

/**
 * Storage for user profile picture
 */
const profilePicStorage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const userId = req.user._id;
    if (!userId)
      cb(new Error(stringConstants.USER_ID_NOT_FOUND_IN_REQUEST), false);
    const fileDestination = path.join(
      __dirname,
      `../public/${userId}/profile_pictures`
    );

    try {
      const exists = fs.existsSync(fileDestination);
      if (!exists) fs.mkdirSync(fileDestination);
    } catch (error) {
      return cb(error, false);
    }

    cb(null, fileDestination);
  },
  filename: function (req, file, cb) {
    const dateTime = Date.now();
    const extension = path.extname(file.originalname).toLowerCase();
    const rand = getRandomIntInclusive(100, 999);
    // const fileName = `${dateTime}${rand}_profile_pic${extension}`;
    const fileName = `profile_pic${extension}`;
    cb(null, fileName);
  },
});

/**
 * Storage for card grading
 */
const cardGradingStorage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const cardId = req.cardId;
    const userId = req.user._id;
    if (!cardId) cb(new Error(stringConstants.CARD_ID_NOT_FOUND), false);
    if (!userId)
      cb(new Error(stringConstants.USER_ID_NOT_FOUND_IN_REQUEST), false);
    const parentDir = path.join(__dirname, `../public/${userId}/cards/`);
    const fileDestination = path.join(
      __dirname,
      `../public/${userId}/cards/${cardId}/`
    );
    const dirs = [parentDir, fileDestination];
    try {
      for (const dir of dirs) {
        const exists = fs.existsSync(dir);
        if (!exists) fs.mkdirSync(dir);
      }
    } catch (error) {
      return cb(error, false);
    }

    cb(null, fileDestination);
  },
  filename: function (req, file, cb) {
    const dateTime = Date.now();
    const extension = path.extname(file.originalname).toLowerCase();
    const rand = getRandomIntInclusive(100, 999);
    // const fileName = `${dateTime}${rand}_card_grade${extension}`;
    const fileName = `card_grade${extension}`;
    cb(null, fileName);
  }
});

/**
 * Storage for game card front
 */
const cardFrontStorage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const cardId = req.cardId;
    const userId = req.user._id;
    if (!cardId) cb(new Error(stringConstants.CARD_ID_NOT_FOUND), false);
    if (!userId)
      cb(new Error(stringConstants.USER_ID_NOT_FOUND_IN_REQUEST), false);
    const parentDir = path.join(__dirname, `../public/${userId}/cards/`);
    const fileDestination = path.join(
      __dirname,
      `../public/${userId}/cards/${cardId}/`
    );
    const userPath = path.join(
      __dirname,
      `../public/${userId}/`
    );
  
    if (!fs.existsSync(userPath)) {
      fs.mkdirSync(userPath);
      fs.mkdirSync(`${userPath}cards/`);
    }
    const dirs = [parentDir, fileDestination];
    try {
      for (const dir of dirs) {
        const exists = fs.existsSync(dir);
        if (!exists) fs.mkdirSync(dir);
      }
    } catch (error) {
      return cb(error, false);
    }

    cb(null, fileDestination);
  },
  filename: function (req, file, cb) {
    const dateTime = Date.now();
    const extension = path.extname(file.originalname).toLowerCase();
    const rand = getRandomIntInclusive(100, 999);
    // const fileName = `${dateTime}${rand}_card_front${extension}`;
    const fileName = `card_front${extension}`;
    cb(null, fileName);
  },
});
/**
 * Storage for game card back
 */
const cardBackStorage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const cardId = req.cardId;
    const userId = req.user._id;

    if (!cardId) cb(new Error(stringConstants.CARD_ID_NOT_FOUND), false);
    if (!userId)
      cb(new Error(stringConstants.USER_ID_NOT_FOUND_IN_REQUEST), false);

    const parentDir = path.join(__dirname, `../public/${userId}/cards/`);
    const fileDestination = path.join(
      __dirname,
      `../public/${userId}/cards/${cardId}/`
    );
    const userPath = path.join(
      __dirname,
      `../public/${userId}/`
    );
  
    if (!fs.existsSync(userPath)) {
      fs.mkdirSync(userPath);
      fs.mkdirSync(`${userPath}cards/`);
    }
    const dirs = [parentDir, fileDestination];
    try {
      for (const dir of dirs) {
        const exists = fs.existsSync(dir);
        if (!exists) fs.mkdirSync(dir);
      }
    } catch (error) {
      return cb(error, false);
    }

    cb(null, fileDestination);
  },
  filename: function (req, file, cb) {
    const dateTime = Date.now();
    const extension = path.extname(file.originalname).toLowerCase();
    const rand = getRandomIntInclusive(100, 999);
    // const fileName = `${dateTime}${rand}_card_back${extension}`;
    const fileName = `card_back${extension}`;
    cb(null, fileName);
  },
});

/**
 * Storage for game card back
 */
const cardStorage = multer.diskStorage({
    destination: async function (req, file, cb) {
      const cardId = req.cardId;
      const userId = req.user._id;
  
      if (!cardId) cb(new Error(stringConstants.CARD_ID_NOT_FOUND), false);
      if (!userId)
        cb(new Error(stringConstants.USER_ID_NOT_FOUND_IN_REQUEST), false);
  
      const parentDir = path.join(__dirname, `../public/${userId}/cards/`);
      const fileDestination = path.join(
        __dirname,
        `../public/${userId}/cards/${cardId}/`
      );
      const userPath = path.join(
        __dirname,
        `../public/${userId}/`
      );
    
      if (!fs.existsSync(userPath)) {
        fs.mkdirSync(userPath);
        fs.mkdirSync(`${userPath}cards/`);
      }
      const dirs = [parentDir, fileDestination];
      try {
        for (const dir of dirs) {
          const exists = fs.existsSync(dir);
          if (!exists) fs.mkdirSync(dir);
        }
      } catch (error) {
        return cb(error, false);
      }
  
      cb(null, fileDestination);
    },
    filename: function (req, file, cb) {
      const extension = path.extname(file.originalname).toLowerCase();
      const fileName = `${file.fieldname}${extension}`;
      cb(null, fileName);
    },
  });

/**
 * Storage to upload the video of the card
 */
const cardVideoStorage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const cardId = req.cardId;
    const userId = req.user._id;

    if (!cardId) cb(new Error(stringConstants.CARD_ID_NOT_FOUND), false);
    if (!userId)
      cb(new Error(stringConstants.USER_ID_NOT_FOUND_IN_REQUEST), false);

    const parentDir = path.join(__dirname, `../public/${userId}/cards/`);
    const fileDestination = path.join(
      __dirname,
      `../public/${userId}/cards/${cardId}/`
    );
    const dirs = [parentDir, fileDestination];
    try {
      for (const dir of dirs) {
        const exists = fs.existsSync(dir);
        if (!exists) fs.mkdirSync(dir);
      }
    } catch (error) {
      return cb(error, false);
    }

    cb(null, fileDestination);
  },
  filename: function (req, file, cb) {
    const dateTime = Date.now();
    const extension = path.extname(file.originalname).toLowerCase();
    const rand = getRandomIntInclusive(100, 999);
    // const fileName = `${dateTime}${rand}_card_video${extension}`;
    const fileName = `card_video${extension}`;
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
    if (
      ext !== stringConstants.iType.PNG &&
      ext !== stringConstants.iType.JPG &&
      ext !== stringConstants.iType.GIF &&
      ext !== stringConstants.iType.JPEG
    ) {
      return cb(new Error(stringConstants.NOT_A_VALID_FILE_TYPE), false);
    }
    cb(null, true);
  },
}).single("profilePicture");


/**
 * Multer function for upload card grading
 */
module.exports.uploadCardGrading = multer({
  storage: cardGradingStorage,
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (
      ext !== stringConstants.iType.PNG &&
      ext !== stringConstants.iType.JPG &&
      ext !== stringConstants.iType.GIF &&
      ext !== stringConstants.iType.JPEG
    ) {
      return cb(new Error(stringConstants.NOT_A_VALID_FILE_TYPE), false);
    }
    cb(null, true);
  },
}).single("cardGrading");

module.exports.uploadCardFields = multer({
    storage: cardStorage,
    fileFilter: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        if (
            ext !== stringConstants.iType.PNG &&
            ext !== stringConstants.iType.JPG &&
            ext !== stringConstants.iType.GIF &&
            ext !== stringConstants.iType.JPEG
        ) {
            return cb(new Error(stringConstants.NOT_A_VALID_FILE_TYPE), false);
        }
        cb(null, true);
  },
  }).any();

/**
 * Multer function for upload front of game card
 */
module.exports.uploadCardFront = multer({
  storage: cardFrontStorage,
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (
      ext !== stringConstants.iType.PNG &&
      ext !== stringConstants.iType.JPG &&
      ext !== stringConstants.iType.GIF &&
      ext !== stringConstants.iType.JPEG
    ) {
      return cb(new Error(stringConstants.NOT_A_VALID_FILE_TYPE), false);
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
    if (
      ext !== stringConstants.iType.PNG &&
      ext !== stringConstants.iType.JPG &&
      ext !== stringConstants.iType.GIF &&
      ext !== stringConstants.iType.JPEG
    ) {
      return cb(new Error(stringConstants.NOT_A_VALID_FILE_TYPE), false);
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
      ext !== stringConstants.vType.THREEGP &&
      ext !== stringConstants.vType.MPFOUR &&
      ext !== stringConstants.vType.TS &&
      ext !== stringConstants.vType.WEBM &&
      ext !== stringConstants.vType.MKV &&
      ext !== stringConstants.vType.MOV &&
      ext !== stringConstants.vType.MFOURV
    ) {
      return cb(new Error(stringConstants.NOT_A_VALID_FILE_TYPE), false);
    }
    cb(null, true);
  },
}).single("cardVideo");
