const express = require("express");
const mongoose = require("mongoose");
const SimpleLogger = require('./../../utils/simpleLogger');
const router = express.Router();
const auth = require("../../middlewares/authenticateUser");
const appAuth = require("../../middlewares/authenticateApp");
const { valCardPost } = require("../../middlewares/validation");
const { valPageSizeNumber } = require("../../middlewares/validation");
const { Collection } = require("../../models/collection");
const { User } = require("../../models/user");
const { Card } = require("../../models/card");
const { createResObject } = require("../../utils/utilFunctions");
const { stringConstants } = require("../../utils/constants");
const { errorObjects } = require("../../utils/errorObjects");
const { getOrCreateAndGetUserCollectionSortedList, removeCardFromCollectionSortedList, addCardInCollectionSortedList } = require("../../services/dragDropSort/collectionCardSortList.service");
const { collectionCardSortController } = require("../../controllers/")
const {
  collectionListValidation
} = require('../../middlewares/validators');

/**
 * POST route to add card to collection
 */
router.post("/add", [appAuth, auth, valCardPost], async (req, res) => {
    const userId = req.user._id;
    const cardId = req.body.cardId;
    const user = await User.findById(userId);
    if (!user)
        return res
        .status(400)
        .send(
            createResObject(
            false,
            {},
            stringConstants.USER_ID_DOEST_NOT_EXISTS,
            errorObjects.USER_ID_DOEST_NOT_EXISTS
            )
        );
    
    const card = await Card.findById(cardId);
    if (!card)
        return res
        .status(400)
        .send(
            createResObject(
            false,
            {},
            stringConstants.CARD_ID_NOT_FOUND,
            errorObjects.CARD_ID_NOT_FOUND
            )
        );
    const cardInCollection = await Collection.find({ card: cardId }).lean();
    if (cardInCollection && cardInCollection.length)
    return res
        .status(400)
        .send(
            createResObject(
            false,
            {},
            stringConstants.CARD_ALREADY_EXIST,
            errorObjects.CARD_ALREADY_EXIST
            )
        );
    // Create a new collection
    let collection = new Collection({
        user: userId,
        card: cardId
    });
    collection = await collection.save();
    await addCardInCollectionSortedList(collection)
    return res.send(
        createResObject(true, { }, stringConstants.UPDATE_SUCCESSFUL)
    );
});

/**
 * Route to get all graded cards
 */
router.get(
    "/cards/:pageSize/:pageNumber",
    [appAuth, auth, valPageSizeNumber],
    async (req, res) => {
        const pageSize = parseInt(req.params.pageSize);
        const pageNumber = parseInt(req.params.pageNumber);
        const userId = req.user._id;

        const userCollectionList = await getOrCreateAndGetUserCollectionSortedList(
            userId,
            pageSize,
            pageNumber
          );

        const numCollection = userCollectionList.collectionList.cards.length;

        let m = { $match : { "_id" : { "$in" : userCollectionList.cardsToFetch } } };
        let a = { $addFields : { "__order" : { $indexOfArray : [ userCollectionList.cardsToFetch, "$_id" ] } } };
        let s = { $sort : { "__order" : 1 } };

        let cards = await Card.aggregate([m,a,s]); 

        cards = cards.map((card) => {
            return Card.getCardDetailsWithGrading(card);
        });

        return res.send(
            createResObject(
                true,
                { cards, numCards: numCollection },
                stringConstants.FETCH_SUCESSFUL
            )
        );
    }
);

/**
 * POST route to delete card from collection
 */
router.delete("/delete", [appAuth, auth], async (req, res) => {
    const cardId = req.query.cardId;
    if (!cardId)
    return res
        .status(400)
        .send(
            createResObject(
                false,
                {},
                stringConstants.REQUEST_VALIDATION_FAILED,
                errorObjects.REQUEST_VALIDATION_ERROR(
                    "No card found in query parameters"
                )
            )
        );
    try {
        const userId = req.user._id;
        const user = mongoose.Types.ObjectId(userId);
        const card = mongoose.Types.ObjectId(cardId);
        let collection = await Collection.find({ user, card });
        if (collection && collection.length) {
            collection = await Collection.deleteOne({ user, card });
            await removeCardFromCollectionSortedList(card, user)
            return res.send(
                createResObject(true, { deletedCount: collection.deletedCount }, stringConstants.DELETED_SUCCESSFULLY)
            );
        } else {
            return res
            .status(400)
            .send(
                createResObject(
                    false,
                    {},
                    stringConstants.NO_CARD_FOR_USER,
                    errorObjects.NO_CARD_FOR_USER
                )
            );
        }
    } catch (error) {
        SimpleLogger.error(error);
        return res
            .status(400)
            .send(
                createResObject(
                    false,
                    {},
                    stringConstants.UNSUSPECTED_ERROR,
                    errorObjects.UNSUSPECTED_ERROR(error.message)
                )
            );
    }
});

router.put('/move-collection-card/:cardId', [
    appAuth, auth, collectionListValidation.changeIndexOfCardSortList
  ], collectionCardSortController.changeIndexOfCardSortList)

module.exports = router;
