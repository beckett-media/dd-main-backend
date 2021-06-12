const mongoose = require("mongoose");
const { stringConstants } = require("../utils/constants");

const gradeSchema = new mongoose.Schema(
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
	},
	{ timestamps: true }
);

const Grade = mongoose.model(
	stringConstants.collectionNames.GRADES_COLLECTION,
	gradeSchema
);

module.exports.Grade = Grade;
