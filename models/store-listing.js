const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { stringConstants } = require("../utils/constants");

const StoreListingSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		quantity: {
			type: Number,
			required: true,
		},
		availableQuantity: {
			type: Number,
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
		condition: {
			type: String,
			required: true,
		},
		playerNames: { type: [String], default: [], required: false },
		cardType: {
			type: String,
			required: true,
		},
		sport: {
			type: String,
			required: true,
		},
		cardNumber: {
			type: String,
		},
		year: {
			type: Number,
			required: true,
		},
		brand: {
			type: String,
			required: true,
		},
		modelNo: {
			type: String,
		},
		serialNumber: {
			type: String,
			required: false,
		},
		tags: [{ type: String }],
		images: { type: [String], default: [], required: false },
		isPublic: {
			type: Boolean,
			default: false,
		},
		product: {
			type: String,
			enum: [
				stringConstants.productState.SINGLE,
				stringConstants.productState.BOX_CARD,
				stringConstants.productState.CASE_CARD,
				stringConstants.productState.PACK_CARD,
				stringConstants.productState.TEAMSET_CARD,
			],
			required: true,
		},
		// productOption: {
		// 	type: String,
		// 	default: "",
		// },
		grade: {
			type: String,
			enum: [
				stringConstants.gradeState.GRADE_10,
				stringConstants.gradeState.GRADE_15,
				stringConstants.gradeState.GRADE_20,
				stringConstants.gradeState.GRADE_25,
				stringConstants.gradeState.GRADE_30,
				stringConstants.gradeState.GRADE_35,
				stringConstants.gradeState.GRADE_40,
				stringConstants.gradeState.GRADE_45,
				stringConstants.gradeState.GRADE_50,
				stringConstants.gradeState.GRADE_55,
				stringConstants.gradeState.GRADE_60,
				stringConstants.gradeState.GRADE_65,
				stringConstants.gradeState.GRADE_70,
				stringConstants.gradeState.GRADE_75,
				stringConstants.gradeState.GRADE_80,
				stringConstants.gradeState.GRADE_85,
				stringConstants.gradeState.GRADE_90,
				stringConstants.gradeState.GRADE_95,
				stringConstants.gradeState.GRADE_100,
				stringConstants.gradeState.GRADE_RAW,
			],
			required: true,
		},
		status: {
			type: String,
			enum: [
				stringConstants.listingState.LISTING_SALE,
				stringConstants.listingState.LISTING_SOLD,
			],
			default: stringConstants.listingState.LISTING_SALE,
			required: true,
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: stringConstants.collectionNames.USER_COLLECTION,
			required: true,
		},
		card: {
			type: Schema.Types.ObjectId,
			ref: stringConstants.collectionNames.CARD_COLLECTION,
			required: false,
		},
		store: {
			type: Schema.Types.ObjectId,
			ref: stringConstants.collectionNames.STORES_COLLECTION,
			required: false,
		}
	},
	{ timestamps: true, toJSON: { getters: true } }
);

const StoreListing = mongoose.model(
	stringConstants.collectionNames.STORE_LISTING_COLLECTION,
	StoreListingSchema
);
module.exports.StoreListing = StoreListing;
