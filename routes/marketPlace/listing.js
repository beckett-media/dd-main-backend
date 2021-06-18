const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const auth = require("../../middlewares/authenticateUser");
const appAuth = require("../../middlewares/authenticateApp");
const {
	valCardPost,
	valLisitngCardData,
	valObjectIdInUrl,
} = require("../../middlewares/validation");
const SimpleLogger = require("../../utils/simpleLogger");
const path = require("path");
const fsPromises = require("fs").promises;
const _ = require("lodash");
const Jimp = require("jimp");

const { valPageSizeNumber } = require("../../middlewares/validation");
const { Listing } = require("../../models/listing");
const { Marketplace } = require("../../models/marketplace");
const { User } = require("../../models/user");
const { Card } = require("../../models/card");
const { Product } = require("../../models/product");
const { Grade } = require("../../models/grade");
const { createResObject } = require("../../utils/utilFunctions");
const { stringConstants } = require("../../utils/constants");
const { errorObjects } = require("../../utils/errorObjects");
const { uploadMultiImage } = require("../../middlewares/multerSingle");
const { Order } = require("../../models/order");

/**
 * Route to get listing by user
 */
router.get(
	"/:pageSize/:pageNumber",
	[appAuth, auth, valPageSizeNumber],
	async (req, res) => {
		const pageSize = parseInt(req.params.pageSize);
		const pageNumber = parseInt(req.params.pageNumber);
		const userId = req.user._id;

		const totalListing = await Listing.find({ user: userId })
			.sort({ createdAt: 1 })
			.skip((pageNumber - 1) * pageSize)
			.limit(pageSize);
		if (totalListing.length > 0) {
			return res.send(
				createResObject(
					true,
					{ listing: totalListing },
					stringConstants.FETCH_SUCESSFUL
				)
			);
		} else {
			return res.send(
				createResObject(true, { listing: [] }, stringConstants.FETCH_SUCESSFUL)
			);
		}
	}
);

/**
 * Route to get list/card detail
 */

router.get("/:cardId", [appAuth, auth], async (req, res) => {
	const cardId = req.params.cardId;
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
	const cardDetail = await Listing.aggregate([
		{ $match: { _id: mongoose.Types.ObjectId(cardId) } },
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
	]);
	return res.send(
		createResObject(true, { cardDetail }, stringConstants.FETCH_SUCESSFUL)
	);
});

/**
 * POST route to add card to listing
 */
router.post(
	"/create",
	[appAuth, auth, valLisitngCardData],
	async (req, res) => {
		const userId = req.user._id;
		const cardId = req.body.cardId;
		const productId = req.body.productId;
		// const productOptionId = req.body.productOptionId;
		const gradeId = req.body.gradeId;
		const title = req.body.title;
		const description = req.body.description;
		const quantity = req.body.quantity;
		const price = req.body.price;
		const condition = req.body.condition;
		const serialNumber = req.body.serialNumber;
		const tags = req.body.tags;
		const isPublic = req.body.isPublic;
		const playerNames = req.body.playerNames;
		const user = await User.findById(userId);
		if (!user)
			return res
				.status(400)
				.send(
					createResObject(
						false,
						{},
						stringConstants.USER_ID_DOEST_NOT_EXISTS,
						errorObjects.USER_ID_DOEST_NOT_EXISTS
					)
				);
		if (cardId !== "") {
			const card = await Card.findById(cardId);
			if (!card)
				return res
					.status(400)
					.send(
						createResObject(
							false,
							{},
							stringConstants.CARD_ID_NOT_FOUND,
							errorObjects.CARD_ID_NOT_FOUND
						)
					);
			const cardInLisitng = await Listing.find({
				card: cardId,
			}).lean();
			if (cardInLisitng && cardInLisitng.length)
				return res
					.status(400)
					.send(
						createResObject(
							false,
							{},
							stringConstants.CARD_ALREADY_EXIST,
							errorObjects.CARD_ALREADY_EXIST
						)
					);
		}

		const product = await Product.findById(productId);
		if (!product)
			return res
				.status(400)
				.send(
					createResObject(
						false,
						{},
						stringConstants.PRODUCT_ID_NOT_FOUND,
						errorObjects.PRODUCT_ID_NOT_FOUND
					)
				);
		// if (productOptionId !== "") {
		// 	const productOption = await Product.findOne({
		// 		_id: productId,
		// 		options: { $elemMatch: { _id: productOptionId } },
		// 	});

		// 	if (!productOption)
		// 		return res
		// 			.status(400)
		// 			.send(
		// 				createResObject(
		// 					false,
		// 					{},
		// 					stringConstants.PRODUCT_ID_NOT_FOUND,
		// 					errorObjects.PRODUCT_ID_NOT_FOUND
		// 				)
		// 			);
		// }

		const grade = await Grade.findById(gradeId);
		if (!grade)
			return res
				.status(400)
				.send(
					createResObject(
						false,
						{},
						stringConstants.GRADE_ID_NOT_FOUND,
						errorObjects.GRADE_ID_NOT_FOUND
					)
				);
		// Create a new card in listing
		let listing = new Listing({
			user: userId,
			card: cardId,
			product: productId,
			// productOption: productOptionId,
			grade: gradeId,
			title: title,
			description: description,
			quantity: quantity,
			price: price,
			condition: condition,
			serialNumber: serialNumber,
			tags: tags,
			isPublic: isPublic,
			playerNames: playerNames,
		});
		listing = await listing.save();
		if (isPublic) {
			let marketplace = await Marketplace.findOne({ listing: listing._id });
			console.log("marketplace", marketplace);
			if (!marketplace) {
				let addListingMarket = await Marketplace.create({
					listing: listing._id,
					user: userId,
				});
			}
		}

		return res.send(
			createResObject(
				true,
				{ listing },
				stringConstants.CARD_ADD_LISTING_SUCCESSFULLY
			)
		);
	}
);

/**
 * POST route to update listing by images
 */
router.post(
	"/update-lsiting-images/:listingId",
	[appAuth, auth, valObjectIdInUrl],
	async (req, res) => {
		const cardId = req.params.listingId;
		const userId = req.user._id;
		let listing = await Listing.findById(cardId);
		if (!listing) {
			return res
				.status(404)
				.send(
					createResObject(
						false,
						{},
						stringConstants.CARD_ID_NOT_FOUND,
						errorObjects.CARD_ID_NOT_FOUND
					)
				);
		}

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

		// Upload the images of the listing
		req.cardId = cardId;
		uploadMultiImage(req, res, async function (err) {
			if (err) {
				SimpleLogger.error(err);
				// If file type error return relavent message
				if (err.message === stringConstants.NOT_A_VALID_FILE_TYPE) {
					return res
						.status(415)
						.send(
							createResObject(
								false,
								{},
								stringConstants.FILE_TYPE_NOT_ACCEPTED,
								errorObjects.FILE_TYPE_NOT_ACCEPTED
							)
						);
				}
				// Otherwise return unsuspected error
				return next(err);
			}

			// Check files exists
			if (!req.files)
				return res
					.status(400)
					.send(
						createResObject(
							false,
							{},
							stringConstants.NO_FILE_FOUND,
							errorObjects.NO_FILE_FOUND
						)
					);
			// Check files size if corrupt delete the uploaded file
			let images = [];
			if (req.files.length > 0) {
				for (const file of req.files) {
					if (file.size <= 0) {
						const cardDestination = path.join(
							__dirname,
							"../../public/",
							`${userId}/listing/${cardId}/`,
							`${req.file.filename}`
						);
						try {
							await fsPromises.unlink(cardDestination);
						} catch (err) {
							SimpleLogger.error(err);
							await new PendingDeletion({
								deletionType: stringConstants.deletionType.FILE,
								data: cardDestination,
							}).save();
						}
						return res
							.status(400)
							.send(
								createResObject(
									false,
									{},
									stringConstants.FILE_CORRUPTED,
									errorObjects.FILE_CORRUPTED
								)
							);
					}
					images.push(path.join(`${userId}/listing/${cardId}/`, file.filename));
				}
			}
			listing.images = images;
			listing = await listing.save();

			return res.send(
				createResObject(true, { listing }, stringConstants.UPDATE_SUCCESSFUL)
			);
		});
	}
);

/**
 * POST route to add a listing into marketplace
 */

router.post(
	"/add-marketplace/:listingId",
	[appAuth, auth, valObjectIdInUrl],
	async (req, res) => {
		const cardId = req.params.listingId;
		const userId = req.user._id;
		let listing = await Listing.findById(cardId);
		if (!listing) {
			return res
				.status(404)
				.send(
					createResObject(
						false,
						{},
						stringConstants.CARD_ID_NOT_FOUND,
						errorObjects.CARD_ID_NOT_FOUND
					)
				);
		}

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
		if (userId !== listing.user.toString())
			return res
				.status(401)
				.send(
					createResObject(
						false,
						{},
						stringConstants.UNAUTHENTICATE_USER,
						errorObjects.UNAUTHENTICATE_USER
					)
				);
		let checkListing = await Marketplace.findOne({ listing: cardId });
		if (checkListing)
			return res
				.status(400)
				.send(
					createResObject(
						false,
						{},
						stringConstants.LISTING_EXIST_MARKETPLACE,
						errorObjects.LISTING_EXIST_MARKETPLACE
					)
				);

		let addMarket = await Marketplace.create({
			listing: cardId,
			user: userId,
		});
		let updateListing = await Listing.findByIdAndUpdate(
			cardId,
			{ $set: { isPublic: true } },
			{ new: true }
		);
		return res.send(
			createResObject(
				true,
				{ updateListing },
				stringConstants.LISTING_ADD_MARKETPLACE_SUCCESSFULLY
			)
		);
	}
);

/**
 * Route to get buying listing by user
 */
router.get(
	"/buying/:pageSize/:pageNumber",
	[appAuth, auth, valPageSizeNumber],
	async (req, res) => {
		const pageSize = parseInt(req.params.pageSize);
		const pageNumber = parseInt(req.params.pageNumber);
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

		const buyingListing = await Order.aggregate([
			{ $match: { buyer: mongoose.Types.ObjectId(userId) } },
			{
				$lookup: {
					from: "users",
					localField: "seller",
					foreignField: "_id",
					as: "seller",
				},
			},
			{ $unwind: { path: "$seller" } },
			{
				$lookup: {
					from: "listings",
					localField: "listing",
					foreignField: "_id",
					as: "listing",
				},
			},
			{ $unwind: { path: "$listing" } },
			{
				$project: {
					_id: "$_id",
					status: "$status",
					buyer: "$buyer",
					seller: {
						_id: "$seller._id",
						fullName: "$seller.fullName",
						email: "$seller.email",
					},
					listing: "$listing",
				},
			},
			{ $skip: (pageNumber - 1) * pageSize },
			{ $sort: { createdAt: 1 } },
			{ $limit: pageSize },
		]);

		return res.send(
			createResObject(true, buyingListing, stringConstants.FETCH_SUCESSFUL)
		);
	}
);

/**
 * Route to get selling listing by user
 */
router.get(
	"/selling/:pageSize/:pageNumber",
	[appAuth, auth, valPageSizeNumber],
	async (req, res) => {
		const pageSize = parseInt(req.params.pageSize);
		const pageNumber = parseInt(req.params.pageNumber);
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

		const buyingListing = await Order.aggregate([
			{ $match: { seller: mongoose.Types.ObjectId(userId) } },
			{
				$lookup: {
					from: "users",
					localField: "buyer",
					foreignField: "_id",
					as: "buyer",
				},
			},
			{ $unwind: { path: "$buyer" } },
			{
				$lookup: {
					from: "listings",
					localField: "listing",
					foreignField: "_id",
					as: "listing",
				},
			},
			{ $unwind: { path: "$listing" } },
			{
				$project: {
					_id: "$_id",
					status: "$status",
					seller: "$seller",
					buyer: {
						_id: "$buyer._id",
						fullName: "$buyer.fullName",
						email: "$buyer.email",
					},
					listing: "$listing",
				},
			},
			{ $skip: (pageNumber - 1) * pageSize },
			{ $sort: { createdAt: 1 } },
			{ $limit: pageSize },
		]);

		return res.send(
			createResObject(true, buyingListing, stringConstants.FETCH_SUCESSFUL)
		);
	}
);

module.exports = router;
