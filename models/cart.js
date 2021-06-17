const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const path = require("path");
const fsPromises = require("fs").promises;
const SimpleLogger = require("../utils/simpleLogger");
const rimraf = require("rimraf");
const _ = require("lodash");
const { PendingDeletion } = require("./pendingDeletion");
const { stringConstants } = require("../utils/constants");

const cartSchema = new mongoose.Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: stringConstants.collectionNames.USER_COLLECTION,
			required: true,
		},
		user: {
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
