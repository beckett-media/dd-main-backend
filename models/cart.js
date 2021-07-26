const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { stringConstants } = require("../utils/constants");

const cartSchema = new mongoose.Schema(
	{
		quantity: {
			type: Number,
			required: true,
		},
		user: {
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
const Cart = mongoose.model(
	stringConstants.collectionNames.CART_COLLECTION,
	cartSchema
);

module.exports.Cart = Cart;
