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
 * Route to get all graded cards
 */
router.get("/dashboard", [appAuth, auth], async (req, res) => {
	const pageSize = parseInt(req.params.pageSize);
	const pageNumber = parseInt(req.params.pageNumber);
	const userId = req.user._id;

	const numCollection = await Collection.count({ user: userId });

	const collection = await Collection.aggregate([
		{ $match: { user: mongoose.Types.ObjectId(userId) } },
		{
			$group: {
				_id: { user: "$user" },
				user: { $first: "$user" },
				card: { $addToSet: "$card" },
			},
		},
		{ $skip: (pageNumber - 1) * pageSize },
		{ $sort: { createdAt: 1 } },
		{ $limit: pageSize },
	]);

	if (collection && collection.length) {
		const [onlyCollection] = collection;

		const { card } = onlyCollection;
		let cardData = await Card.find({ _id: { $in: card } });
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
});

module.exports = router;
