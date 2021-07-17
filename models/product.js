const mongoose = require("mongoose");
const { stringConstants } = require("../utils/constants");

const productSchema = new mongoose.Schema(
	{
		_id: {
			type: String,
			required: true,
			trim: true,
		},
		name: {
			type: String,
			required: true,
		},
		desc: {
			type: String,
			required: true,
		},
		options: [
			{
				_id: { type: String, trim: true },
				name: { type: String },
				des: { type: String },
			},
		],
	},
	{ timestamps: true }
);

const Product = mongoose.model(
	stringConstants.collectionNames.PRODUCTS_COLLECTION,
	productSchema
);

module.exports.Product = Product;
