const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const auth = require("../../middlewares/authenticateUser");
const appAuth = require("../../middlewares/authenticateApp");
const {
	valCardPost,
	valMarketPlaceCardData,
	valObjectIdInUrl,
} = require("../../middlewares/validation");
const SimpleLogger = require("../../utils/simpleLogger");
const path = require("path");
const fsPromises = require("fs").promises;
const _ = require("lodash");
const Jimp = require("jimp");

const { valPageSizeNumber } = require("../../middlewares/validation");
const { Marketplace } = require("../../models/marketplace");
const { User } = require("../../models/user");
const { Card } = require("../../models/card");
const { Product } = require("../../models/product");
const { Grade } = require("../../models/grade");
const { createResObject } = require("../../utils/utilFunctions");
const { stringConstants } = require("../../utils/constants");
const { errorObjects } = require("../../utils/errorObjects");
const { uploadMultiImage } = require("../../middlewares/multerSingle");
const { Listing } = require("../../models/listing");
const { Order } = require("../../models/order");

/**
 * Route to get all marketplace data
 */
router.get("/", [appAuth, auth], async (req, res) => {
	const pageSize = 10;
	const userId = req.user._id;
	const user = await User.findById(userId);
	if (!user)
		return res
			.status(404)
			.send(
				createResObject(
					false,
					{},
					stringConstants.USER_ID_DOEST_NOT_EXISTS,
					errorObjects.USER_ID_DOEST_NOT_EXISTS
				)
			);
	const products = await Product.find();
	const grade = await Grade.find();
	const newArrivals = await Listing.find({
		$and: [
			{ isPublic: true },
			{ status: stringConstants.listingState.LISTING_SALE },
		],
	})
		.sort({ _id: -1 })
		.limit(pageSize);

	const trendingLisitnProduct = await Order.aggregate([
		{
			$lookup: {
				from: "listings",
				localField: "listing",
				foreignField: "_id",
				as: "card",
			},
		},
		{ $unwind: { path: "$card" } },
		{
			$lookup: {
				from: "products",
				localField: "card.product",
				foreignField: "_id",
				as: "card.product",
			},
		},
		{ $unwind: { path: "$card.product" } },
		{
			$lookup: {
				from: "users",
				localField: "card.user",
				foreignField: "_id",
				as: "card.user",
			},
		},
		{ $unwind: { path: "$card.user" } },
		{
			$group: {
				_id: "$card.product._id",
			},
		},
		{ $sort: { _id: -1 } },
		{ $limit: 50 },
	]);
	let trendingLisitnProductId = trendingLisitnProduct.map((element, idx) => {
		return element._id;
	});
	const trendingCards = await Listing.aggregate([
		{
			$match: {
				$and: [
					{ product: { $in: trendingLisitnProductId } },
					{ user: { $ne: userId } },

					{ isPublic: true },
					{ status: stringConstants.listingState.LISTING_SALE },
				],
			},
		},
		{
			$lookup: {
				from: "users",
				localField: "user",
				foreignField: "_id",
				as: "seller",
			},
		},
		{ $unwind: { path: "$seller" } },
		{
			$project: {
				_id: "$_id",
				tags: "$tags",
				images: "$images",
				product: "$product",
				grade: "$grade",
				title: "$title",
				description: "$description",
				price: "$price",
				condition: "$condition",
				isPublic: "$isPublic",
				status: "$status",
				playerNames: "$playerNames",
				seller: {
					_id: "$seller._id",
					fullName: "$seller.fullName",
					email: "$seller.email",
				},
			},
		},
		{ $sort: { _id: -1 } },
		{ $limit: 10 },
	]);
	// trading list for current user
	const trendingPlayers = await Listing.aggregate([
		{
			$match: {
				$and: [
					{ product: { $in: trendingLisitnProductId } },
					{ user: { $ne: userId } },
					{ isPublic: true },
					{ status: stringConstants.listingState.LISTING_SALE },
					{ $expr: { $gte: [{ $size: "$playerNames" }, 1] } },
				],
			},
		},
		{
			$lookup: {
				from: "users",
				localField: "user",
				foreignField: "_id",
				as: "seller",
			},
		},
		{ $unwind: { path: "$seller" } },
		{
			$project: {
				_id: "$_id",
				tags: "$tags",
				images: "$images",
				product: "$product",
				grade: "$grade",
				title: "$title",
				description: "$description",
				price: "$price",
				condition: "$condition",
				isPublic: "$isPublic",
				status: "$status",
				seller: {
					_id: "$seller._id",
					fullName: "$seller.fullName",
					email: "$seller.email",
				},
			},
		},
		{ $sort: { _id: -1 } },
		{ $limit: 50 },
	]);
	// check order for current user recommendation list
	const checkCurrentUserOrder = await Order.find({ buyer: userId }).distinct(
		"listing"
	);
	const recommendationListByPrice = await Listing.aggregate([
		{
			$match: {
				_id: { $in: checkCurrentUserOrder },
			},
		},
		{ $project: { max: { $max: "$price" }, min: { $min: "$price" } } },
	]);

	const recommendation = await Listing.aggregate([
		{
			$match: {
				$and: [
					{ user: { $ne: mongoose.Types.ObjectId(userId) } },
					{
						price: {
							$gte: recommendationListByPrice[0].min,
							$lte: recommendationListByPrice[0].max,
						},
					},

					{ isPublic: true },
					{ status: stringConstants.listingState.LISTING_SALE },
				],
			},
		},
		{
			$lookup: {
				from: "users",
				localField: "user",
				foreignField: "_id",
				as: "seller",
			},
		},
		{ $unwind: { path: "$seller" } },
		{
			$project: {
				_id: "$_id",
				tags: "$tags",
				images: "$images",
				product: "$product",
				grade: "$grade",
				title: "$title",
				description: "$description",
				price: "$price",
				condition: "$condition",
				isPublic: "$isPublic",
				status: "$status",
				seller: {
					_id: "$seller._id",
					fullName: "$seller.fullName",
					email: "$seller.email",
				},
			},
		},
		{ $sort: { _id: -1 } },
		{ $limit: 50 },
	]);
	return res.send(
		createResObject(
			true,
			{
				products: products,
				grades: grade,
				newArrival: newArrivals,
				trendingCards: trendingCards,
				trendingPlayers: trendingPlayers,
				recommendation:
					recommendation.length === 0 ? trendingCards : recommendation,
			},
			stringConstants.FETCH_SUCESSFUL
		)
	);
});

module.exports = router;
