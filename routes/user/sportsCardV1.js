const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/authenticateUser');
const appAuth = require('../../middlewares/authenticateApp');
const { User } = require('../../models/user');
const { Card } = require('../../models/card');
const { Listing } = require('../../models/listing');
const { Collection } = require('../../models/collection');
const { stringConstants } = require('../../utils/constants');
const { errorObjects } = require('../../utils/errorObjects');
const { createResObject } = require('../../utils/utilFunctions');
const {
  valObjectIdInUrl,
  valPageSizeNumber
} = require('../../middlewares/validation');
const {
  dragDropValidation
} = require('../../middlewares/validators');
const {
  getOrCreateAndGetUserGradedSortedList 
} = require("../../services/dragDropSort/gradedCardSortList.service")
const { gradedCardSortController } = require("../../controllers/")

/**
 * Step 1: Create a new card and upload card front
 */
router.post('/add-front', [appAuth, auth], async (req, res, next) => {
  const userId = req.user._id;
  const cardFront = req.body.cardFront;
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
  
    if (!cardFront) {
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
  // Create a new card
  let card = new Card({
    user: userId,
  });
  const cardId = card._id;

  // Send card ID to multer
  req.cardId = cardId;

  card.front = cardFront;
  card = await card.save();
  card = card.getCardDetailsWithGrading();

  return res.send(
    createResObject(true, { card }, stringConstants.UPDATE_SUCCESSFUL)
  );
  
});
/**
 * Since user can go back and update the picture
 * Route to update the front. Since we don't know
 * thee add of the card in add card front
 * separte route is used for updating front
 */
router.post(
  '/update-front/:cardId',
  [appAuth, auth, valObjectIdInUrl],
  async (req, res, next) => {
    const userId = req.user._id;
    const cardFront = req.body.cardFront;
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

    if (!cardFront) {
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

    req.cardId = cardId;
    card.front = cardFront;
    card = await card.save();
    card = card.getCardDetailsWithGrading();

    return res.send(
      createResObject(true, { card }, stringConstants.UPDATE_SUCCESSFUL)
    );
  }
);

/**
 * Step 2: Add back of the card picture to an existing card
 * requires the card id in request
 */
router.post(
  '/add-update-back/:cardId',
  [appAuth, auth, valObjectIdInUrl],
  async (req, res) => {
    const cardId = req.params.cardId;
    const cardBack = req.body.cardBack;
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
  
    if (!cardBack) {
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

    // Upload the back of the card
    req.cardId = cardId;
    card.back = cardBack;
      card = await card.save();

      card = card.getCardDetailsWithGrading();

      return res.send(
        createResObject(true, { card }, stringConstants.UPDATE_SUCCESSFUL)
    );
  }
);


/**
 * Get all graded cards for the user with sorted list for drag and drop functionality
 */
 router.get(
  "/graded-cards/:pageSize/:pageNumber",
  [appAuth, auth, valPageSizeNumber],
  async (req, res) => {
    const pageSize = parseInt(req.params.pageSize);
    const pageNumber = parseInt(req.params.pageNumber);
    const userId = req.user._id;
    const userGradedList = await getOrCreateAndGetUserGradedSortedList(
      userId,
      pageSize,
      pageNumber
    );

    const numCards = userGradedList.gradedList.cards.length;

    let cards = await Card.find({
      _id: {
        $in: userGradedList.cardsToFetch,
      },
    });

    cards = cards.map((card) => {
      return card.getCardDetailsWithGrading();
    });

    const collectionCards = await Collection.find({
      card: {
        $in: userGradedList.cardsToFetch,
      },
    });

    const stringCards =
      collectionCards.length > 0
        ? collectionCards.map((collection) => collection.card.toString())
        : [];

    const inListing = await Listing.find({
      card: {
        $in: userGradedList.cardsToFetch,
      },
    });

    const stringListingCards =
      inListing.length > 0
        ? inListing.map((listing) => listing.card.toString())
        : [];

    cards = cards.map((card) => {
      const { id = "" } = card;
      return {
        ...card,
        inCollection: stringCards.includes(id.toString()),
        inListing: stringListingCards.includes(id.toString()),
      };
    });

    return res.send(
      createResObject(
        true,
        { cards, numCards, userGradedList },
        stringConstants.FETCH_SUCESSFUL
      )
    );
  }
);

router.post('/move-graded-card/:cardId', [
  appAuth, auth, dragDropValidation.changeIndexOfCardSortList
], gradedCardSortController.changeIndexOfCardSortList)

module.exports = router;
