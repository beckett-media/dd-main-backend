const mongoose = require("mongoose");
const shortid = require("shortid");
const Schema = mongoose.Schema;
const { stringConstants } = require("../utils/constants");

const orderSchema = new mongoose.Schema(
	{
		price: {
			type: Number,
			required: true,
		},
		status: {
			type: String,
			default: "pending",
		},
		address: {
			type: Schema.Types.ObjectId,
			ref: stringConstants.collectionNames.ADDRESS_COLLECTION,
			required: false,
		},
		completeAddress: {
			type: String,
			required: false,
		},
		buyer: {
			type: Schema.Types.ObjectId,
			ref: stringConstants.collectionNames.USER_COLLECTION,
			required: false,
		},
		orderId: {
			type: String,
			default: shortid.generate,
		},
	},
	{ timestamps: true, toJSON: { getters: true } }
);

const Order = mongoose.model(
	stringConstants.collectionNames.ORDER_COLLECTION,
	orderSchema
);
module.exports.Order = Order;
