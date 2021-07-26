const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const auth = require("../../middlewares/authenticateUser");
const appAuth = require("../../middlewares/authenticateApp");
const { valCard } = require("../../middlewares/validation");
const SimpleLogger = require("../../utils/simpleLogger");
const path = require("path");
const fsPromises = require("fs").promises;
const _ = require("lodash");
const currency = require("../../utils/currency");
const Jimp = require("jimp");
const { User } = require("../../models/user");
const { Card } = require("../../models/card");
const { Collection } = require("../../models/collection");
const { PendingDeletion } = require("../../models/pendingDeletion");
const { stringConstants } = require("../../utils/constants");
const { errorObjects } = require("../../utils/errorObjects");
const { createResObject } = require("../../utils/utilFunctions");
const {
  uploadCardFront,
  uploadCardBack,
  uploadCardVideo,
  uploadCardGrading
} = require("../../middlewares/multerSingle");
const {
  valObjectIdInUrl,
  valUpdateCardData,
  valPageSizeNumber,
} = require("../../middlewares/validation");
const sightengine = require('sightengine')('1635467598', 'i3u4TqqhAnoxcSgAxgv5');
const centerGrading = require('../../grading/center');
const cornerGrading = require('../../grading/corner');

/**
 * Step 1: Create a new card and upload card front
 */
router.post("/add-front", [appAuth, auth], async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user)
    return res
      .status(404)
      .send(
        createResObject(
          false,
          {},
          stringConstants.USER_ID_DOEST_NOT_EXISTS,
          errorObjects.USER_ID_DOEST_NOT_EXISTS
        )
      );
  // Create a new card
  let card = new Card({
    user: userId,
  });
  const cardId = card._id;

  // Send card ID to multer
  req.cardId = cardId;

  uploadCardFront(req, res, async function (err) {
    if (err) {
      SimpleLogger.error(err);
      // If file type error return relavent message
      if (err.message === stringConstants.NOT_A_VALID_FILE_TYPE) {
        return res
          .status(415)
          .send(
            createResObject(
              false,
              {},
              stringConstants.FILE_TYPE_NOT_ACCEPTED,
              errorObjects.FILE_TYPE_NOT_ACCEPTED
            )
          );
      }
      // Otherwise return unsuspected error
      return next(err);
    }

    // Check file exists
    if (!req.file)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.NO_FILE_FOUND,
            errorObjects.NO_FILE_FOUND
          )
        );
    // Check file size if corrupt delete the uploaded file
    if (req.file.size <= 0) {
      const cardDestination = path.join(
        __dirname,
        "../../public/",
        `${userId}/cards/${cardId}/`,
        `${req.file.filename}`
      );
      try {
        await fsPromises.unlink(cardDestination);
      } catch (err) {
        SimpleLogger.error(err);
        await new PendingDeletion({
          deletionType: stringConstants.deletionType.FILE,
          data: cardDestination,
        }).save();
      }
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.FILE_CORRUPTED,
            errorObjects.FILE_CORRUPTED
          )
        );
    }

    // Check file quality is not good
    // const cardDestination = path.join(
    //   __dirname,
    //   "../../public/",
    //   `${userId}/cards/${cardId}/`,
    //   `${req.file.filename}`
    // );
    // const { brightness = 0, contrast = 0, sharpness = 0 } = await sightengine.check(['properties']).set_file(cardDestination) || {};
    // const badCondition = brightness <= 0.3 || sharpness <= 0.6 || contrast <=0.3;

    // if (badCondition) {
    //   try {
    //     await fsPromises.unlink(cardDestination);
    //   } catch (err) {
    //     SimpleLogger.error(err);
    //     await new PendingDeletion({
    //       deletionType: stringConstants.deletionType.FILE,
    //       data: cardDestination,
    //     }).save();
    //   }
    //   return res
    //     .status(400)
    //     .send(
    //       createResObject(
    //         false,
    //         {},
    //         stringConstants.BAD_QUALITY,
    //         errorObjects.BAD_QUALITY
    //       )
    //     );
    // }

    card.front = path.join(`${userId}/cards/${cardId}/`, req.file.filename);
    card = await card.save();
    card = card.getCardDetailsWithGrading();

    return res.send(
      createResObject(true, { card }, stringConstants.UPDATE_SUCCESSFUL)
    );
  });
});
/**
 * Since user can go back and update the picture
 * Route to update the front. Since we don't know
 * thee add of the card in add card front
 * separte route is used for updating front
 */
router.post(
  "/update-front/:cardId",
  [appAuth, auth, valObjectIdInUrl],
  async (req, res, next) => {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .send(
          createResObject(
            false,
            {},
            stringConstants.USER_ID_DOEST_NOT_EXISTS,
            errorObjects.USER_ID_DOEST_NOT_EXISTS
          )
        );
    // Check for card using ID
    const cardId = req.params.cardId;

    let card = await Card.findById(cardId);
    if (!card)
      return res.send(
        createResObject(
          false,
          {},
          stringConstants.CARD_ID_NOT_FOUND,
          errorObjects.CARD_ID_NOT_FOUND
        )
      );

    req.cardId = cardId;
    uploadCardFront(req, res, async function (err) {
      if (err) {
        SimpleLogger.error(err);
        // If file type error return relavent message
        if (err.message === stringConstants.NOT_A_VALID_FILE_TYPE) {
          return res
            .status(415)
            .send(
              createResObject(
                false,
                {},
                stringConstants.FILE_TYPE_NOT_ACCEPTED,
                errorObjects.FILE_TYPE_NOT_ACCEPTED
              )
            );
        }
        // Otherwise return unsuspected error
        return next(err);
      }

      // Check file exists
      if (!req.file)
        return res
          .status(400)
          .send(
            createResObject(
              false,
              {},
              stringConstants.NO_FILE_FOUND,
              errorObjects.NO_FILE_FOUND
            )
          );

      // Check file size if corrupt delete the uploaded file
      if (req.file.size <= 0) {
        const cardDestination = path.join(
          __dirname,
          "../../public/",
          `${userId}/cards/${cardId}/`,
          `${req.file.filename}`
        );
        try {
          await fsPromises.unlink(cardDestination);
        } catch (err) {
          SimpleLogger.error(err);
          await new PendingDeletion({
            deletionType: stringConstants.deletionType.FILE,
            data: cardDestination,
          }).save();
        }
        return res
          .status(400)
          .send(
            createResObject(
              false,
              {},
              stringConstants.FILE_CORRUPTED,
              errorObjects.FILE_CORRUPTED
            )
          );
      }

      // Check file quality is not good
    // const cardDestination = path.join(
    //   __dirname,
    //   "../../public/",
    //   `${userId}/cards/${cardId}/`,
    //   `${req.file.filename}`
    // );
    // const { brightness = 0, contrast = 0, sharpness = 0 } = await sightengine.check(['properties']).set_file(cardDestination) || {};
    // const badCondition = brightness <= 0.3 || sharpness <= 0.6 || contrast <=0.3;

    // if (badCondition) {
    //   try {
    //     await fsPromises.unlink(cardDestination);
    //   } catch (err) {
    //     SimpleLogger.error(err);
    //     await new PendingDeletion({
    //       deletionType: stringConstants.deletionType.FILE,
    //       data: cardDestination,
    //     }).save();
    //   }
    //   return res
    //     .status(400)
    //     .send(
    //       createResObject(
    //         false,
    //         {},
    //         stringConstants.BAD_QUALITY,
    //         errorObjects.BAD_QUALITY
    //       )
    //     );
    // }

      // All the check completed delete the old card and update the new
      /*
      if (card.front) {
        const pathToCardFront = path.join(
          __dirname,
          "../../public/",
          card.front
        );
        try {
          await fsPromises.unlink(pathToCardFront);
        } catch (error) {
          SimpleLogger.error(error);
          await new PendingDeletion({
            deletionType: stringConstants.deletionType.FILE,
            data: pathToCardFront,
          }).save();
        }
      }
      */

      card.front = path.join(`${userId}/cards/${cardId}/`, req.file.filename);
      card = await card.save();
      card = card.getCardDetailsWithGrading();

      return res.send(
        createResObject(true, { card }, stringConstants.UPDATE_SUCCESSFUL)
      );
    });
  }
);

/**
 * Step 2: Add back of the card picture to an existing card
 * requires the card id in request
 */
router.post(
  "/add-update-back/:cardId",
  [appAuth, auth, valObjectIdInUrl],
  async (req, res) => {
    const cardId = req.params.cardId;
    const userId = req.user._id;
    let card = await Card.findById(cardId);
    if (!card) {
      return res
        .status(404)
        .send(
          createResObject(
            false,
            {},
            stringConstants.CARD_ID_NOT_FOUND,
            errorObjects.CARD_ID_NOT_FOUND
          )
        );
    }

    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(404)
        .send(
          createResObject(
            false,
            {},
            stringConstants.USER_ID_DOEST_NOT_EXISTS,
            errorObjects.USER_ID_DOEST_NOT_EXISTS
          )
        );

    // Upload the back of the card
    req.cardId = cardId;
    uploadCardBack(req, res, async function (err) {
      if (err) {
        SimpleLogger.error(err);
        // If file type error return relavent message
        if (err.message === stringConstants.NOT_A_VALID_FILE_TYPE) {
          return res
            .status(415)
            .send(
              createResObject(
                false,
                {},
                stringConstants.FILE_TYPE_NOT_ACCEPTED,
                errorObjects.FILE_TYPE_NOT_ACCEPTED
              )
            );
        }
        // Otherwise return unsuspected error
        return next(err);
      }

      // Check file exists
      if (!req.file)
        return res
          .status(400)
          .send(
            createResObject(
              false,
              {},
              stringConstants.NO_FILE_FOUND,
              errorObjects.NO_FILE_FOUND
            )
          );
      // Check file size if corrupt delete the uploaded file
      if (req.file.size <= 0) {
        const cardDestination = path.join(
          __dirname,
          "../../public/",
          `${userId}/cards/${cardId}/`,
          `${req.file.filename}`
        );
        try {
          await fsPromises.unlink(cardDestination);
        } catch (err) {
          SimpleLogger.error(err);
          await new PendingDeletion({
            deletionType: stringConstants.deletionType.FILE,
            data: cardDestination,
          }).save();
        }
        return res
          .status(400)
          .send(
            createResObject(
              false,
              {},
              stringConstants.FILE_CORRUPTED,
              errorObjects.FILE_CORRUPTED
            )
          );
      }

      // Check file quality is not good
    // const cardDestination = path.join(
    //   __dirname,
    //   "../../public/",
    //   `${userId}/cards/${cardId}/`,
    //   `${req.file.filename}`
    // );
    // const { brightness = 0, contrast = 0, sharpness = 0 } = await sightengine.check(['properties']).set_file(cardDestination) || {};
    // const badCondition = brightness <= 0.3 || sharpness <= 0.6 || contrast <=0.3;

    // if (badCondition) {
    //   try {
    //     await fsPromises.unlink(cardDestination);
    //   } catch (err) {
    //     SimpleLogger.error(err);
    //     await new PendingDeletion({
    //       deletionType: stringConstants.deletionType.FILE,
    //       data: cardDestination,
    //     }).save();
    //   }
    //   return res
    //     .status(400)
    //     .send(
    //       createResObject(
    //         false,
    //         {},
    //         stringConstants.BAD_QUALITY,
    //         errorObjects.BAD_QUALITY
    //       )
    //     );
    // }

      // Delete previous picture if any
      /*
      if (card.back) {
        try {
          const cardBackPath = path.join(__dirname, "../../public/", card.back);
          await fsPromises.unlink(cardBackPath);
        } catch (error) {
          SimpleLogger.error(error);
          await new PendingDeletion({
            deletionType: stringConstants.deletionType.FILE,
            data: path.join(
              __dirname,
              "../../public/card_backs/",
              `${req.file.filename}`
            ),
          }).save();
        }
      }
      */
      card.back = path.join(`${userId}/cards/${cardId}/`, req.file.filename);
      card = await card.save();

      card = card.getCardDetailsWithGrading();

      return res.send(
        createResObject(true, { card }, stringConstants.UPDATE_SUCCESSFUL)
      );
    });
  }
);

/**
 * Step 3: This is where the user will upload the video for the game card
 */
router.post(
  "/add-update-video/:cardId",
  [appAuth, auth, valObjectIdInUrl],
  async (req, res) => {
    const cardId = req.params.cardId;
    const userId = req.user._id;
    let card = await Card.findById(cardId);
    if (!card) {
      return res
        .status(404)
        .send(
          createResObject(
            false,
            {},
            stringConstants.CARD_ID_NOT_FOUND,
            errorObjects.CARD_ID_NOT_FOUND
          )
        );
    }

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .send(
          createResObject(
            false,
            {},
            stringConstants.USER_ID_DOEST_NOT_EXISTS,
            errorObjects.USER_ID_DOEST_NOT_EXISTS
          )
        );

    req.cardId = cardId;
    uploadCardVideo(req, res, async function (err) {
      if (err) {
        SimpleLogger.error(err);
        // If file type error return relavent message
        if (err.message === stringConstants.NOT_A_VALID_FILE_TYPE) {
          return res
            .status(415)
            .send(
              createResObject(
                false,
                {},
                stringConstants.FILE_TYPE_NOT_ACCEPTED,
                errorObjects.FILE_TYPE_NOT_ACCEPTED
              )
            );
        }
        if (err.message === "Unexpected field") {
          return res
            .status(400)
            .send(
              createResObject(
                false,
                {},
                stringConstants.REQUEST_VALIDATION_FAILED,
                errorObjects.REQUEST_VALIDATION_ERROR(
                  new Error("Key not valid")
                )
              )
            );
        }
        // Otherwise return unsuspected error
        return next(err);
      }

      if (!req.file) {
        return res
          .status(400)
          .send(
            createResObject(
              false,
              {},
              stringConstants.NO_FILE_FOUND,
              errorObjects.NO_FILE_FOUND
            )
          );
      }

      if (req.file.size <= 0) {
        const cardDestination = path.join(
          __dirname,
          "../../public/",
          `${userId}/cards/${cardId}/`,
          `${req.file.filename}`
        );
        try {
          await fsPromises.unlink(cardDestination);
        } catch (error) {
          SimpleLogger.error(error);
          await new PendingDeletion({
            deletionType: stringConstants.deletionType.FILE,
            data: cardDestination,
          }).save();
        }
        return res
          .status(400)
          .send(
            createResObject(
              true,
              {},
              stringConstants.FILE_CORRUPTED,
              errorObjects.FILE_CORRUPTED
            )
          );
      }

      /**
       * Multer automatically replaces the existing 
       * picture
       */
      card.video = path.join(
        `${userId}/cards/${cardId}/`,
        `${req.file.filename}`
      );
      card = await card.save();

      card = card.getCardDetailsWithGrading();

      return res.send(
        createResObject(true, { card }, stringConstants.UPDATE_SUCCESSFUL)
      );
    });
  }
);
/**
 * Step 4: This is where user will remaining information of the card. The last step
 * to upload the card. Card isCompleted will turn to true but status will still
 * be pending. It will only change to submitted once we receive the payment
 */
router.post(
  "/add-card-data/:cardId",
  [appAuth, auth, valObjectIdInUrl, valUpdateCardData],
  async (req, res) => {
    const userId = req.user._id;
    const cardId = req.params.cardId;
    let card = await Card.findById(cardId);
    if (!card)
      return res
        .status(404)
        .send(
          createResObject(
            false,
            {},
            stringConstants.CARD_ID_NOT_FOUND,
            errorObjects.CARD_ID_NOT_FOUND
          )
        );

    const year = req.body.year;
    const brand = req.body.brand;
    const cardNumber = req.body.cardNumber;
    const playerNames = req.body.playerNames;
    const serialNo = req.body.serialNo;
    const modelNo = req.body.modelNo;
    const cardType = req.body.cardType;

    card.year = year;
    card.brand = brand;
    card.cardNumber = cardNumber;
    card.playerNames = playerNames;
    card.serialNo = serialNo;
    card.modelNo = modelNo;
    card.cardType = cardType;

    card.isCompleted = card.checkIfCompleted();

    // Save the thumbnail of the card
    // Resizing card image while maintaining aspect ratio
    if (card.isCompleted) {
      let image;

      const cardFront = path.join(__dirname, "../../public/", card.front);
      const extension = path.extname(card.front).toLowerCase();
      const thumbnailDest = path.join(
        __dirname,
        "../../public/",
        `${userId}/cards/${card._id}/`,
        `card_thumbnail${extension}`
      );

      try {
        image = await Jimp.read(cardFront);
        const cardHeight = image.getHeight();
        // const cardWidth = image.getWidth();
        const ratio = 200 / cardHeight;
        image.scale(ratio);
        await image.write(thumbnailDest);
        card.thumbnail = path.join(
          `${userId}/cards/${card._id}/`,
          `card_thumbnail${extension}`
        );
      } catch (error) {
        SimpleLogger.error(error);
      }
    }

    card = await card.save();

    card = card.getCardDetailsWithGrading();

    return res.send(
      createResObject(true, { card }, stringConstants.UPDATE_SUCCESSFUL)
    );
  }
);

/**
 * API endpoint to delete card with the card ID
 */
router.delete(
  "/delete-card/:cardId",
  [appAuth, auth, valObjectIdInUrl],
  async (req, res, next) => {
    const cardId = req.params.cardId;
    let card = await Card.findById(cardId);
    if (!card)
      return res
        .status(404)
        .send(
          createResObject(
            false,
            {},
            stringConstants.CARD_ID_NOT_FOUND,
            errorObjects.CARD_ID_NOT_FOUND
          )
        );

    if (req.user._id !== card.user.toString())
      return res
        .status(401)
        .send(
          createResObject(
            false,
            {},
            stringConstants.NOT_AUTHORIZED_TO_PERFORM_THE_ACTION,
            errorObjects.NOT_AUTHORIZED_TO_PERFORM_THE_ACTION
          )
        );

    card = await card.remove();

    return res.send(
      createResObject(
        true,
        { card: card.getCardDetailsWithGrading() },
        stringConstants.DELETED_SUCCESSFULLY
      )
    );
  }
);

/**
 * API endpoint to get list of pending cards for user
 * Checks if status is pending and isComplete is true
 */
router.get(
  "/pending-payment-cards/:pageSize/:pageNumber",
  [appAuth, auth, valPageSizeNumber],
  async (req, res) => {
    const pageSize = parseInt(req.params.pageSize);
    const pageNumber = parseInt(req.params.pageNumber);

    let cards = await Card.find({
      $and: [
        { user: req.user._id },
        { isCompleted: true },
        { status: stringConstants.cardState.PENDING },
      ],
    }).lean();
    /**
     * Card pricing:
     * $4.99 for <= 100
     * $7.99 for > 100
     */
    let pendingAmount = 0,
      price = 0;
    const numCards = cards.length;
    if (numCards <= 100) {
      price = "4.99";
      pendingAmount = currency(price).multiply(numCards);
    } else if (numCards > 100) {
      price = "7.99";
      pendingAmount = currency(price).multiply(numCards);
    }

    // Query again for pagination
    cards = await Card.find({
      $and: [
        { user: req.user._id },
        { isCompleted: true },
        { status: stringConstants.cardState.PENDING },
      ],
    })
      .sort({ createdAt: 1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    cards = cards.map((card) => {
      return card.getCardDetailsWithGrading();
    });

    return res.send(
      createResObject(
        true,
        { cards: cards, pendingAmount, numCards },
        stringConstants.FETCH_SUCESSFUL
      )
    );
  }
);

/**
 * Route to get all cards pending grading for user
 */
router.get(
  "/pending-grading-cards/:pageSize/:pageNumber",
  [appAuth, auth, valPageSizeNumber],
  async (req, res) => {
    const pageSize = parseInt(req.params.pageSize);
    const pageNumber = parseInt(req.params.pageNumber);

    let cards = await Card.find({
      $and: [
        { user: req.user._id },
        { status: stringConstants.cardState.SUBMITTED },
        { isCompleted: true },
      ],
    }).lean();
    const numCards = cards.length;

    cards = await Card.find({
      $and: [
        { user: req.user._id },
        { status: stringConstants.cardState.SUBMITTED },
        { isCompleted: true },
      ],
    })
      .sort({ createdAt: 1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    cards = cards.map((card) => {
      return card.getCardDetailsWithGrading();
    });

    return res.send(
      createResObject(
        true,
        { cards, numCards },
        stringConstants.FETCH_SUCESSFUL
      )
    );
  }
);

/**
 * Get all graded cards for the user
 */
router.get(
  "/graded-cards/:pageSize/:pageNumber",
  [appAuth, auth, valPageSizeNumber],
  async (req, res) => {
    const pageSize = parseInt(req.params.pageSize);
    const pageNumber = parseInt(req.params.pageNumber);
    const userId = req.user._id;

    let cards = await Card.find({
      $and: [
        { user: userId },
        { status: stringConstants.cardState.GRADED },
        { isCompleted: true },
      ],
    });

    const numCards = cards.length;

    cards = await Card.find({
      $and: [
        { user: req.user._id },
        { status: stringConstants.cardState.GRADED },
        { isCompleted: true },
      ],
    })
      .sort({ createdAt: 1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    cards = cards.map((card) => {
      return card.getCardDetailsWithGrading();
    });

    const collectionCards = await Collection.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      { $group: {
              _id: { user: "$user" },
              user:  { $first: "$user" },
              card: { $addToSet: "$card" }
          }
      },
      { $skip: (pageNumber - 1) * pageSize },
      { $sort : { createdAt : 1 } },
      { $limit: pageSize }
    ]);
    const [onlyCollection = {}] = collectionCards || [];
    const { card: innerCards = [] } = onlyCollection;
    const stringCards = innerCards.length > 0 ? JSON.stringify(innerCards.map(card => card.toString())) : [];
    
    cards = cards.map(card => {
      const { id = '' } = card;
      return {
        ...card,
        inCollection: stringCards.includes(id.toString())
      }
    })

    return res.send(
      createResObject(
        true,
        { cards, numCards },
        stringConstants.FETCH_SUCESSFUL
      )
    );
  }
);

/**
 * Step 1: Create a new card and upload card front
 */
router.post("/add-grading", [appAuth, auth], async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user)
    return res
      .status(404)
      .send(
        createResObject(
          false,
          {},
          stringConstants.USER_ID_DOEST_NOT_EXISTS,
          errorObjects.USER_ID_DOEST_NOT_EXISTS
        )
      );
  // Create a new card
  let card = new Card({
    user: userId,
  });
  const cardId = card._id;

  // Send card ID to multer
  req.cardId = cardId;

  uploadCardGrading(req, res, async function (err) {
    if (err) {
      SimpleLogger.error(err);
      // If file type error return relavent message
      if (err.message === stringConstants.NOT_A_VALID_FILE_TYPE) {
        return res
          .status(415)
          .send(
            createResObject(
              false,
              {},
              stringConstants.FILE_TYPE_NOT_ACCEPTED,
              errorObjects.FILE_TYPE_NOT_ACCEPTED
            )
          );
      }
      // Otherwise return unsuspected error
      return next(err);
    }

    // Check file exists
    if (!req.file)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.NO_FILE_FOUND,
            errorObjects.NO_FILE_FOUND
          )
        );
    // Check file size if corrupt delete the uploaded file
    if (req.file.size <= 0) {
      const cardDestination = path.join(
        __dirname,
        "../../public/",
        `${userId}/cards/${cardId}/`,
        `${req.file.filename}`
      );
      try {
        await fsPromises.unlink(cardDestination);
      } catch (err) {
        SimpleLogger.error(err);
        await new PendingDeletion({
          deletionType: stringConstants.deletionType.FILE,
          data: cardDestination,
        }).save();
      }
      return res
        .status(400)
        .send(
          createResObject(
            true,
            {},
            stringConstants.FILE_CORRUPTED,
            errorObjects.FILE_CORRUPTED
          )
        );
    }

    const filePath = path.join(`${userId}/cards/${cardId}/`, req.file.filename);
    card = await card.save();
    card = card.getCardDetailsWithGrading();

    const { id = '' } = card;

    let cenGrading = await centerGrading(id, filePath);
    let corGrading = await cornerGrading(id, filePath);
    cenGrading = cenGrading > 0 ? cenGrading / 2 : 0;
    corGrading = corGrading > 0 ? corGrading / 2 : 0;

    const grading = cenGrading + corGrading;
    return res.send(
      createResObject(true, { ...card, grading }, stringConstants.GRADING_COMPLETED)
    );
  });
});

router.get('/card-details/:cardId', [appAuth, auth, valCard], async (req, res, next) => {
  const { cardId = '' } = req.params;
  try {
    let card = await Card.findById(cardId);
    if (!card)
      return res.send(
        createResObject(
          false,
          {},
          stringConstants.CARD_ID_NOT_FOUND,
          errorObjects.CARD_ID_NOT_FOUND
        )
      );

    card = card.getCardDetailsWithGrading();

    return res.send(
        createResObject(true, { ...card }, stringConstants.CARD_DETAILS)
    );
  } catch(e) {
    return res.send(
      createResObject(
        false,
        {},
        stringConstants.CARD_ID_NOT_FOUND,
        errorObjects.CARD_ID_NOT_FOUND
      )
    );
  }
});

router.get('/card-fac/:cardId', [valCard], async (req, res, next) => {
  const { cardId = '' } = req.params;
  try {
    // card details fetching
    let card = await Card.findById(cardId);
    if (!card)
      return res.send(
        createResObject(
          false,
          {},
          stringConstants.CARD_ID_NOT_FOUND,
          errorObjects.CARD_ID_NOT_FOUND
        )
      );

    // user details fetching
    const userId = card.user
    const user = await User.findById(userId);

    card = card.getCardDetailsWithGrading();

    return res.send(
        createResObject(true, { card, user: user ? user.getUserBasicInfo() : {} }, stringConstants.CARD_FAC)
    );
  } catch(e) {
    return res.send(
      createResObject(
        false,
        {},
        stringConstants.CARD_ID_NOT_FOUND,
        errorObjects.CARD_ID_NOT_FOUND
      )
    );
  }
});


module.exports = router;
