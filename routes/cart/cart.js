const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const auth = require("../../middlewares/authenticateUser");
const appAuth = require("../../middlewares/authenticateApp");
const _ = require("lodash");
const { User } = require("../../models/user");
const { createResObject } = require("../../utils/utilFunctions");
const { stringConstants } = require("../../utils/constants");
const { errorObjects } = require("../../utils/errorObjects");
const { Listing } = require("../../models/listing");
const { Cart } = require("../../models/cart");

/**
 * Route to get all cart of a user
 */
router.get("/", [appAuth, auth], async (req, res) => {
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

	const carts = await Cart.find({
		user: userId,
	}).populate("listing");
	return res.send(
		createResObject(true, { carts }, stringConstants.CART_ADD_SUCCESSFULLY)
	);
});

/**
 * Route to add card into cart
 */
router.post("/add/:listingId", [appAuth, auth], async (req, res) => {
	const listingId = req.params.listingId;
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
	const card = await Listing.findById(listingId);
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
	if (card.user.toString() === userId)
		return res
			.status(401)
			.send(
				createResObject(
					false,
					{},
					stringConstants.CARD_OWN_ERROR,
					errorObjects.CARD_OWN_ERROR
				)
			);
	const cart = await Cart.create({
		user: userId,
		listing: listingId,
	});
	return res.send(
		createResObject(true, {}, stringConstants.CART_ADD_SUCCESSFULLY)
	);
});

/**
 * Route to remove cart by id
 */
router.post("/remove/:cartId", [appAuth, auth], async (req, res) => {
	const cartId = req.params.cartId;
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
	const cart = await Cart.findById(cartId);
	if (!cart)
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
	if (cart.user.toString() !== user._id.toString())
		return res
			.status(401)
			.send(
				createResObject(
					false,
					{},
					stringConstants.UNAUTHENTICATE_USER,
					errorObjects.UNAUTHENTICATE_USER
				)
			);
	await Cart.findByIdAndDelete(cartId);
	return res.send(
		createResObject(true, {}, stringConstants.CART_REMOVE_SUCCESSFULLY)
	);
});

/**
 * Route to remove all cart of a user
 */
router.post("/remove-all", [appAuth, auth], async (req, res) => {
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
	await Cart.deleteMany({ user: { $eq: mongoose.Types.ObjectId(userId) } });
	return res.send(
		createResObject(true, {}, stringConstants.CART_REMOVE_ALL_SUCCESSFULLY)
	);
});

module.exports = router;
