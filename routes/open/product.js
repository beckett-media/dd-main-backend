/**
 * Public card route accesible to general public
 */
const express = require("express");
const router = express.Router();
const { Product } = require("../../models/product");
const { stringConstants } = require("../../utils/constants");
const { createResObject } = require("../../utils/utilFunctions");
const { errorObjects } = require("../../utils/errorObjects");

/**
 * Route to get all card products
 */
router.get("/", async (req, res) => {
	let products = await Product.find();

	if (!products)
		return res
			.status(404)
			.send(
				createResObject(
					false,
					{},
					stringConstants.PRODUCT_NOT_FOUND,
					errorObjects.PRODUCT_NOT_FOUND
				)
			);

	return res.send(
		createResObject(true, { products }, stringConstants.FETCH_SUCESSFUL)
	);
});
module.exports = router;
