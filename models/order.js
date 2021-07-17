const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { stringConstants } = require("../utils/constants");

const orderSchema = new mongoose.Schema(
	{
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
	},
	{ timestamps: true, toJSON: { getters: true } }
);

const Order = mongoose.model(
	stringConstants.collectionNames.ORDER_COLLECTION,
	orderSchema
);
module.exports.Order = Order;
