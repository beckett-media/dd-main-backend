const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { stringConstants } = require("../utils/constants");

const orderLogSchema = new mongoose.Schema(
	{
		response: {
			type: Object,
			required: true,
		},
		order: {
			type: Schema.Types.ObjectId,
			ref: stringConstants.collectionNames.ORDER_COLLECTION,
			required: true,
		},
		buyer: {
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

const OrderLog = mongoose.model(
	stringConstants.collectionNames.ORDER_LOG_COLLECTION,
	orderLogSchema
);
module.exports.OrderLog = OrderLog;
