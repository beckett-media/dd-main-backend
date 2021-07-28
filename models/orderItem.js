const mongoose = require("mongoose");
const shortid = require("shortid");
const Schema = mongoose.Schema;
const { stringConstants } = require("../utils/constants");

const orderItemSchema = new mongoose.Schema(
	{
		quantity: {
			type: Number,
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
		status: {
			type: String,
			enum: [
				stringConstants.orderState.SHIPPING,
				stringConstants.orderState.WAITING_TO_BE_SHIIPED,
				stringConstants.orderState.PENDING,
				stringConstants.orderState.ACTIVE,
				stringConstants.orderState.CANCELED,
				stringConstants.orderState.COMPLETED,
			],
			default: stringConstants.orderState.PENDING,
			required: true,
		},
		address: {
			type: Schema.Types.ObjectId,
			ref: stringConstants.collectionNames.ADDRESS_COLLECTION,
			required: true,
		},
		buyer: {
			type: Schema.Types.ObjectId,
			ref: stringConstants.collectionNames.USER_COLLECTION,
			required: true,
		},
		seller: {
			type: Schema.Types.ObjectId,
			ref: stringConstants.collectionNames.USER_COLLECTION,
			required: true,
		},
		listing: {
			type: Schema.Types.ObjectId,
			ref: stringConstants.collectionNames.Listing_COLLECTION,
			required: true,
		},
		parent: {
			type: Schema.Types.ObjectId,
			ref: stringConstants.collectionNames.ORDER_COLLECTION,
			required: true,
		},
		orderId: {
			type: String,
			default: shortid.generate,
		},
	},
	{ timestamps: true, toJSON: { getters: true } }
);

const OrderItem = mongoose.model(
	stringConstants.collectionNames.ORDER_ITEM_COLLECTION,
	orderItemSchema
);
module.exports.OrderItem = OrderItem;
