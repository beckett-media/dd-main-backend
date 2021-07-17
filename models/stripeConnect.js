const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const path = require("path");
const fsPromises = require("fs").promises;
const SimpleLogger = require("../utils/simpleLogger");
const rimraf = require("rimraf");
const _ = require("lodash");
const { PendingDeletion } = require("./pendingDeletion");
const { stringConstants } = require("../utils/constants");

const stripeConnectSchema = new mongoose.Schema(
	{
		accessToken: {
			type: String,
			required: true,
		},
		livemode: {
			type: String,
			required: true,
		},
		refreshToken: {
			type: String,
			required: true,
		},
		tokenType: {
			type: String,
			required: true,
		},
		stripeUserId: {
			type: String,
			required: false,
		},
		scope: {
			type: String,
			required: true,
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: stringConstants.collectionNames.USER_COLLECTION,
			required: true,
		},
	},
	{ timestamps: true, toJSON: { getters: true } }
);

const StripeConnect = mongoose.model(
	stringConstants.collectionNames.STRIPE_CONNECT_COLLECTION,
	stripeConnectSchema
);

module.exports.StripeConnect = StripeConnect;
