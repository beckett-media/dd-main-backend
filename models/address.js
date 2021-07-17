const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const path = require("path");
const fsPromises = require("fs").promises;
const SimpleLogger = require("../utils/simpleLogger");
const rimraf = require("rimraf");
const _ = require("lodash");
const { PendingDeletion } = require("./pendingDeletion");
const { stringConstants } = require("../utils/constants");

const addressSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: true,
		},
		countryCode: {
			type: String,
			required: true,
		},
		mobile: {
			type: String,
			required: true,
		},
		streetAddress: {
			type: String,
			required: true,
		},
		streetAddress2: {
			type: String,
			required: false,
		},
		city: {
			type: String,
			required: true,
		},
		state: {
			type: String,
			required: true,
		},
		zipcode: {
			type: String,
			required: true,
		},
		isDefaultAddress: {
			type: Boolean,
			default: false,
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: stringConstants.collectionNames.USER_COLLECTION,
			required: true,
		},
	},
	{ timestamps: true, toJSON: { getters: true } }
);

const Address = mongoose.model(
	stringConstants.collectionNames.ADDRESS_COLLECTION,
	addressSchema
);

module.exports.Address = Address;
