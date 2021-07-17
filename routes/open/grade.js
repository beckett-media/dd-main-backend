/**
 * Public card route accesible to general public
 */
const express = require("express");
const router = express.Router();
const { Grade } = require("../../models/grade");
const { stringConstants } = require("../../utils/constants");
const { createResObject } = require("../../utils/utilFunctions");
const { errorObjects } = require("../../utils/errorObjects");

/**
 * Route to get all  grades
 */
router.get("/", async (req, res) => {
	let grades = await Grade.find();

	if (!grades)
		return res
			.status(404)
			.send(
				createResObject(
					false,
					{},
					stringConstants.GRADE_NOT_FOUND,
					errorObjects.GRADE_NOT_FOUND
				)
			);

	return res.send(
		createResObject(true, { grades }, stringConstants.FETCH_SUCESSFUL)
	);
});
module.exports = router;
