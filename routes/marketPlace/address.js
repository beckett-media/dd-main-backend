const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const auth = require("../../middlewares/authenticateUser");
const appAuth = require("../../middlewares/authenticateApp");
const {
	valCardPost,
	valMarketPlaceCardData,
	valObjectIdInUrl,
	valAddress,
} = require("../../middlewares/validation");
const SimpleLogger = require("../../utils/simpleLogger");
const path = require("path");
const _ = require("lodash");

const { valPageSizeNumber } = require("../../middlewares/validation");
const { User } = require("../../models/user");
const { createResObject } = require("../../utils/utilFunctions");
const { stringConstants } = require("../../utils/constants");
const { errorObjects } = require("../../utils/errorObjects");
const { Address } = require("../../models/address");

/**
 * Route to get all addresses by user
 */
router.get("/", [appAuth, auth], async (req, res) => {
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

	const addresses = await Address.find({ user: userId });
	return res.send(
		createResObject(true, addresses, stringConstants.FETCH_SUCESSFUL)
	);
});

/**
 * POST route to add a address
 */

router.post("/add", [appAuth, auth, valAddress], async (req, res) => {
	const userId = req.user._id;
	const fullName = req.body.fullName;
	const countryCode = req.body.countryCode;
	const mobile = req.body.mobile;
	const streetAddress = req.body.streetAddress;
	const streetAddress2 = req.body.streetAddress2;
	const city = req.body.city;
	const state = req.body.state;
	const zipcode = req.body.zipcode;
	const isDefaultAddress = req.body.isDefaultAddress;
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
	if (isDefaultAddress) {
		await Address.updateMany(
			{ user: userId },
			{ $set: { isDefaultAddress: false } }
		);
	}
	await Address.create({
		fullName,
		countryCode,
		mobile,
		streetAddress,
		streetAddress2,
		city,
		state,
		zipcode,
		user: userId,
		isDefaultAddress,
	});
	return res.send(
		createResObject(true, {}, stringConstants.ADDRESS_ADD_SUCCESSFULLY)
	);
});

/**
 * POST route to edit a address
 */

router.post(
	"/edit/:addressId",
	[appAuth, auth, valAddress],
	async (req, res) => {
		const addressId = req.params.addressId;
		const userId = req.user._id;
		const fullName = req.body.fullName;
		const countryCode = req.body.countryCode;
		const mobile = req.body.mobile;
		const streetAddress = req.body.streetAddress;
		const streetAddress2 = req.body.streetAddress2;
		const city = req.body.city;
		const state = req.body.state;
		const zipcode = req.body.zipcode;
		const isDefaultAddress = req.body.isDefaultAddress;
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
		let address = await Address.findById(addressId);
		if (!address) {
			return res
				.status(404)
				.send(
					createResObject(
						false,
						{},
						stringConstants.ADDRESS_ID_NOT_FOUND,
						errorObjects.ADDRESS_ID_NOT_FOUND
					)
				);
		}
		if (userId !== address.user.toString())
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
		address = await Address.findByIdAndUpdate(
			addressId,
			{
				$set: {
					fullName,
					countryCode,
					mobile,
					streetAddress,
					streetAddress2,
					city,
					state,
					zipcode,
					isDefaultAddress,
				},
			},
			{ new: true }
		);

		return res.send(
			createResObject(true, address, stringConstants.ADDRESS_EDIT_SUCCESSFULLY)
		);
	}
);

/**
 * POST route to edit a address type
 */

router.post("/change/:addressId", [appAuth, auth], async (req, res) => {
	const addressId = req.params.addressId;
	const userId = req.user._id;
	const isDefaultAddress = req.body.isDefaultAddress;
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
	let address = await Address.findById(addressId);
	if (!address) {
		return res
			.status(404)
			.send(
				createResObject(
					false,
					{},
					stringConstants.ADDRESS_ID_NOT_FOUND,
					errorObjects.ADDRESS_ID_NOT_FOUND
				)
			);
	}
	if (userId !== address.user.toString())
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
	if (address.isDefaultAddress === true && isDefaultAddress === false)
		return res
			.status(401)
			.send(
				createResObject(
					false,
					{},
					stringConstants.ADDRESS_TYPE_CONFLICT,
					errorObjects.ADDRESS_TYPE_CONFLICT
				)
			);
	if (isDefaultAddress) {
		await Address.updateMany(
			{ user: userId },
			{ $set: { isDefaultAddress: false } }
		);
	}
	address = await Address.findByIdAndUpdate(
		addressId,
		{
			$set: {
				isDefaultAddress,
			},
		},
		{ new: true }
	);

	return res.send(
		createResObject(true, address, stringConstants.ADDRESS_EDIT_SUCCESSFULLY)
	);
});

/**
 * DELETE route to remove a address
 */

router.delete(
	"/remove/:addressId",
	[appAuth, auth, valObjectIdInUrl],
	async (req, res) => {
		const addressId = req.params.addressId;
		const userId = req.user._id;
		let address = await Address.findById(addressId);
		if (!address) {
			return res
				.status(404)
				.send(
					createResObject(
						false,
						{},
						stringConstants.ADDRESS_ID_NOT_FOUND,
						errorObjects.ADDRESS_ID_NOT_FOUND
					)
				);
		}
		if (address.isDefaultAddress)
			return res
				.status(404)
				.send(
					createResObject(
						false,
						{},
						stringConstants.REMVOE_DEFAULT_ADDRESS,
						errorObjects.REMVOE_DEFAULT_ADDRESS
					)
				);
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
		if (userId !== address.user.toString())
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
		await Address.findByIdAndRemove(addressId);
		return res.send(
			createResObject(true, {}, stringConstants.ADDRESS_REMOVE_SUCCESSFULLY)
		);
	}
);

module.exports = router;
