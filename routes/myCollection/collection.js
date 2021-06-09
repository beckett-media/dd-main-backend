const express = require("express");
const mongoose = require("mongoose");
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
    
        const numCollection = await Collection.count({ user: userId });

        const collection = await Collection.aggregate([
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

        if (collection && collection.length) {
            const [onlyCollection] = collection;

            const { card } = onlyCollection;
            let cardData = await Card.find({ _id: { $in: card }});
            cardData = cardData.map((card) => {
                return card.getCardDetailsWithGrading();
            });

            return res.send(
                createResObject(
                    true,
                    { cards: cardData, numCards: numCollection },
                    stringConstants.FETCH_SUCESSFUL
                )
            );
        } else {
            return res.send(
                createResObject(
                    true,
                    { cards: [], numCards: numCollection },
                    stringConstants.FETCH_SUCESSFUL
                )
            );
        }
    }
);

module.exports = router;
