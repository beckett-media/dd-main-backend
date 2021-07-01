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
const config = require("config");
const { StripeConnect } = require("../../models/stripeConnect");
const { OrderLog } = require("../../models/orderLog");
const stripe = require("stripe")(config.get(stringConstants.STRIPE_TEST_KEY));

/**
 * Route to checkout the order
 */
router.post("/checkout", [appAuth, auth], async (req, res) => {
	const userId = req.user._id;
	const cardToken = req.body.cardToken;
	const cardId = req.body.cardId;
	const addressId = req.body.addressId;
	const listingIds = req.body.listingIds;
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
		const listings = await Listing.find({ _id: { $in: listingIds } });
		if (listings.length > 0) {
			const createCustomer = await stripe.customers.create({
				source: cardToken,
				description: "For purchasing sports card",
			});
			for (const list of listings) {
				const stripeObj = await StripeConnect.findOne({
					user: list.user.toString(),
				});
				const charge = await stripe.charges.create({
					amount: list.price,
					currency: "usd",
					customer: createCustomer.id,
					card: cardId,
					application_fee_amount:
						(list.price * stringConstants.APPLICATION_FEE_PERCENTAGE) / 100,
					transfer_data: {
						destination: stripeObj.stripeUserId,
					},
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
			}
			return res.send(
				createResObject(true, {}, stringConstants.ORDER_SUCCESSFULLY)
			);
		}
	} catch (e) {
		return res.status(502).send(createResObject(false, {}, e.message, e));
	}
});

/**
 * Route to get orders by filter(status) of a seller
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
 * Route to change order status
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
