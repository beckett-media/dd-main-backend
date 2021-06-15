const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { stringConstants } = require("../utils/constants");

const marketplaceSchema = new mongoose.Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: stringConstants.collectionNames.USER_COLLECTION,
			required: true,
		},
		listing: {
			type: String,
			required: false,
		},
	},
	{ timestamps: true, toJSON: { getters: true } }
);

const Marketplace = mongoose.model(
	stringConstants.collectionNames.MARKETPLACE_COLLECTION,
	marketplaceSchema
);

/**
 * Static method to check if listing exist
 */

// marketplaceSchema.methods.checkIfLisitExist = function () {
// 	return !!this.listing;
// };
module.exports.Marketplace = Marketplace;
