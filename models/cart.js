const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { stringConstants } = require("../utils/constants");
let mongoose_delete = require('mongoose-delete');

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

cartSchema.plugin(mongoose_delete)

const Cart = mongoose.model(
	stringConstants.collectionNames.CART_COLLECTION,
	cartSchema
);

module.exports.Cart = Cart;
