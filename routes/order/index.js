const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const auth = require("../../middlewares/authenticateUser");
const appAuth = require("../../middlewares/authenticateApp");
const _ = require("lodash");
const { Order } = require("../../models/order");
const { createResObject } = require("../../utils/utilFunctions");
const { stringConstants } = require("../../utils/constants");
const { errorObjects } = require("../../utils/errorObjects");
const { Listing } = require("../../models/listing");
const { User } = require("../../models/user");
const { Cart } = require("../../models/cart");
const config = require("config");
const { StripeConnect } = require("../../models/stripeConnect");
const { OrderLog } = require("../../models/orderLog");
const stripe = require("stripe")(config.get(stringConstants.STRIPE_TEST_KEY));

/**
 * Route to checkout the order and paid to seller
 */
router.post("/checkout", [auth], async (req, res) => {
	const userId = req.user._id;
	const cardToken = req.body.cardToken;
	const customerId = req.body.customerId;
	const addressId = req.body.addressId;
	const cartIds = req.body.cartIds;
	const isCardSave = req.body.isCardSave;
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
	try {
		const listingsIds = await Cart.find({ _id: { $in: cartIds } }).distinct(
			"listing"
		);
		console.log(listingsIds);
		const amount = await Listing.aggregate([
			{ $match: { _id: { $in: listingsIds } } },
			{
				$group: {
					_id: "sum amount",
					totalAmount: { $sum: "$price" },
					count: { $sum: 1 },
				},
			},
		]);
		let cusId = "";
		if (customerId === "") {
			const createCustomer = await stripe.customers.create({
				email: user.email,
				source: cardToken,
				description: "Purchasing sports card",
				metadata: {
					userId: user._id.toString(),
				},
			});
			cusId = createCustomer.id;
			if (isCardSave) {
				await User.findByIdAndUpdate(userId, {
					$set: {
						stripeId: cusId,
					},
				});
			}
		} else {
			cusId = customerId;
		}
		const listings = await Listing.find({ _id: { $in: listingsIds } });
		if (listings.length > 0) {
			const charge = await stripe.charges.create({
				amount: amount[0].totalAmount * 100,
				currency: "usd",
				customer: cusId,
				// card: cardId,
			});
			for (const list of listings) {
				let fee =
					(list.price * stringConstants.APPLICATION_FEE_PERCENTAGE) / 100;
				const cart = await Cart.findOne({
					listing: mongoose.Types.ObjectId(list.id),
				});
				const stripeObj = await StripeConnect.findOne({
					user: list.user.toString(),
				});
				const transfer = await stripe.transfers.create({
					amount: (list.price - fee) * 100,
					currency: "usd",
					source_transaction: charge.id,
					destination: stripeObj.stripeUserId,
				});
				const updateListing = await Listing.findByIdAndUpdate(
					list.id,
					{ $set: { status: "sold" } },
					{ new: true }
				);

				const createOrder = await Order.create({
					buyer: userId,
					seller: list.user.toString(),
					listing: list.id,
					address: addressId,
					status: "pending",
				});
				const orderLog = await OrderLog.create({
					response: charge,
					order: createOrder.id,
					buyer: userId,
					listing: list.id,
				});
				await Cart.remove({ _id: cart._id });
			}
			return res.send(
				createResObject(true, {}, stringConstants.ORDER_SUCCESSFULLY)
			);
		} else {
			return res.send(
				createResObject(true, {}, stringConstants.LISTING_NOT_FOUND)
			);
		}
	} catch (e) {
		return res.status(502).send(createResObject(false, {}, e.message, e));
	}
});

/**
 * Route to filter(status) the orders for seller
 */
router.get("/:filter", [appAuth, auth], async (req, res) => {
	const userId = req.user._id;
	const filter = req.params.filter;
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

	const orders = await Order.find({
		seller: userId,
		status: filter,
	}).populate("listing");
	return res.send(
		createResObject(true, { orders }, stringConstants.FETCH_SUCESSFUL)
	);
});

/**
 * Route to change order status for seller
 */
router.post("/status-change/:orderId", [appAuth, auth], async (req, res) => {
	const orderId = req.params.orderId;
	const userId = req.user._id;
	const orderStatus = req.body.status;
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
	const order = await Order.findById(orderId);
	if (!order)
		return res
			.status(404)
			.send(
				createResObject(
					false,
					{},
					stringConstants.ORDER_ID_NOT_FOUND,
					errorObjects.ORDER_ID_NOT_FOUND
				)
			);
	if (order.seller.toString() !== user._id.toString())
		return res
			.status(404)
			.send(
				createResObject(
					false,
					{},
					stringConstants.UNAUTHENTICATE_USER,
					errorObjects.UNAUTHENTICATE_USER
				)
			);
	let checkValidStatus = Object.values(stringConstants.orderState).includes(
		orderStatus
	);
	if (!checkValidStatus)
		return res
			.status(401)
			.send(
				createResObject(
					false,
					{},
					stringConstants.INVALID_ORDER_STATUS,
					errorObjects.INVALID_ORDER_STATUS
				)
			);
	const updateOrder = await Order.findByIdAndUpdate(
		orderId,
		{ $set: { status: orderStatus } },
		{ new: true }
	);
	return res.send(
		createResObject(true, { updateOrder }, stringConstants.ORDER_STATUS_CHANGE)
	);
});

module.exports = router;
