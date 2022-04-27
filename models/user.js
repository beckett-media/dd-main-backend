const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");
const moment = require("moment");
const path = require("path");
const SimpleLogger = require("../utils/simpleLogger");
const fs = require("fs");
const rimraf = require("rimraf");
const { stringConstants } = require("../utils/constants");
const stripe = require("stripe")(config.get(stringConstants.STRIPE_TEST_KEY));
const { Card } = require("./card");

const userSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: true,
			minlength: 2,
			maxlength: 255,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			minlength: 5,
			maxlength: 255,
			trim: true,
			lowercase: true,
			unique: true,
		},
		password: {
			type: String,
			minlength: 6,
			maxlength: 1024,
		},
		profilePicture: {
			type: String,
		},
		username: {
			type: String,
			unique: true,
			minlength: 5,
			maxlength: 255, // not changing this currently as we need to fix all previous usernames first
			lowercase: true,
			required: false,
			validate: stringConstants.USERNAME_REGEX_VALIDATION,
		},
		role: {
			type: String,
			enum: [stringConstants.role.ADMIN, stringConstants.role.USER],
			default: stringConstants.role.USER,
		},
		deviceTokens: [
			{
				type: String,
			},
		],
		refreshToken: {
			type: String,
		},
		stripeId: {
			type: String,
		},
		appleId: {
			type: String,
		},
		googleId: {
			type: String,
		},
		facebookId: {
			type: String,
		},
		twitterId: {
			type: String,
		},
		isComplete: {
			type: Boolean,
			default: false,
		},
		settings: {
			notifications: {
				type: Boolean,
				default: true,
			},
		},
		subscription: {
			subId: {
				type: String,
				default: "",
			},
			cardsLeft: {
				type: String,
				default: 0,
			},
		},
		metadata: {
			signupType: {
				type: String,
				enum: [
					stringConstants.signupType.EBAY,
					stringConstants.signupType.APPLE,
					stringConstants.signupType.GOOGLE,
					stringConstants.signupType.FACEBOOK,
					stringConstants.signupType.TWITTER,
					stringConstants.signupType.IN_APP,
				],
				default: stringConstants.signupType.IN_APP,
			},
			osType: {
				type: String,
				enum: [
					stringConstants.osType.ANDROID,
					stringConstants.osType.iOS,
					stringConstants.osType.MAC_OS,
					stringConstants.osType.WINDOWS,
					stringConstants.osType.LINUX,
				],
			},
		},
		otp: {
			type: Number,
		},
		isOTPVerified: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

/**
 * Pre hook to create all folders for user and stripe ID
 * 1. User folder
 * 2. Profile Picture folder
 * 3. Card folder
 * 4. Stripe ID
 */
userSchema.pre("save", async function (next) {
	const userDir = path.join(__dirname, "../public", this._id.toString());
	const profilePictureDir = path.join(userDir, "profile_pictures");
	const cardDir = path.join(userDir, "cards");
	const directories = [userDir, profilePictureDir, cardDir];

	try {
		/**
		 * Create all the required user inventories
		 * Then check if inventory does not already exists
		 * if exists then skip creation otherwise create
		 */

		for (const dir of directories) {
			const exists = fs.existsSync(dir);
			if (!exists) fs.mkdirSync(dir);
		}

		// Stripe, if does not exists already create stripe customer
		if (!this.stripeId) {
			const customer = await stripe.customers.create({
				email: this.email,
				description: stringConstants.STRIPE_CUSTOMER_CREATION_DESC,
				metadata: {
					userId: this._id.toString(),
				},
			});

			this.stripeId = customer.id;
		}
	} catch (error) {
		SimpleLogger.error(error);

		// Roll back and delete folders created or
		// do it at once and delete the whole user dir
		try {
			const isThere = fs.existsSync(userDir);
			if (isThere) rimraf.sync(userDir);
		} catch (error) {
			SimpleLogger.error(error);
			await new PendingDeletion({
				deletionType: stringConstants.deletionType.DIR,
				data: userDir,
			}).save();
		}

		return next(error);
	}
	return next();
});
/**
 * Pre hook to delete dependent data
 * Don't want execution to stop due to error in file
 * deletion thus not calling next with error
 */
userSchema.pre("remove", async function (next) {
	// Remove all user cards
	const cards = await Card.find({ user: this._id });
	for (const card of cards) {
		await card.remove();
	}

	// Remove user public folder
	const absolutePath = path.join(__dirname, `../public/${this._id}`);
	try {
		rimraf.sync(absolutePath);
	} catch (error) {
		SimpleLogger.error(error);
		await new PendingDeletion({
			deletionType: stringConstants.deletionType.DIR,
			data: absolutePath,
		}).save();
	}

	if (this.stripeId) {
		try {
			const confirmation = await deleteStripeCustomer(this.stripeId);
			SimpleLogger.info(
				`Stripe deleted customer: ${confirmation.id} deleted: ${confirmation.deleted}`
			);
		} catch (error) {
			SimpleLogger.error(error);
		}
	}

	next();
});
/**
 * Schema method to generate auth token for user
 */
userSchema.methods.generateAuthToken = function () {
	const token = jwt.sign(
		{ _id: this._id, role: this.role },
		config.get(stringConstants.JWT_PRIATE_KEY),
		{ expiresIn: "30d" }
	);
	return {
		token,
		expiry: moment.utc(moment(Date.now()).add(30, "days")).format(),
	};
};

/**
 * Schema method to generate refresh token for user
 */
userSchema.methods.generateRefreshToken = function () {
	const refreshToken = jwt.sign(
		{ _id: this._id },
		config.get(stringConstants.JWT_REFRESH_KEY),
		{ expiresIn: "30d" }
	);
	return {
		token: refreshToken,
		expiry: moment.utc(moment(Date.now()).add(30, "days")).format(),
	};
};
/**
 * Schema method to get basic user info
 */
// "_id", "fullName", "email", "profilePicture", "username"
userSchema.methods.getUserBasicInfo = function () {
	const id = this._id || null;
	const fullName = this.fullName || null;
	const email = this.email || null;
	const profilePicture = this.profilePicture || null;
	const username = this.username || null;
	const signupType = this.metadata.signupType || null;

	return {
		id: id,
		fullName: fullName,
		email: email,
		profilePicture: profilePicture,
		username: username,
		signupType: signupType,
	};
};
/**
 * Schema method to get user details
 */
userSchema.methods.getUserDetails = function () {
	const id = this._id || null;
	const fullName = this.fullName || null;
	const email = this.email || null;
	const profilePicture = this.profilePicture || null;
	const username = this.username || null;
	const role = this.role || null;
	const settings = this.settings || null;
	const signupType = this.metadata.signupType || null;

	return {
		id: id,
		fullName: fullName,
		email: email,
		profilePicture: profilePicture,
		username: username,
		role: role,
		settings: settings,
		signupType: signupType,
	};
};
/**
 * Checks to see if user basic info is complete
 */
userSchema.methods.isBasicInfoCompleted = function () {
	return (
		!!this.fullName && !!this.email && !!this.profilePicture && !!this.username
	);
};

/**
 * Schema function to add token to user's token array
 * Only adds token if it does not already exists
 */
userSchema.methods.addDeviceToken = function (deviceToken) {
	if (this.deviceTokens.indexOf(deviceToken) === -1) {
		this.deviceTokens.push(deviceToken);
	}
	return this.deviceTokens;
};

/**
 * Removes device token from user's device token array
 */
userSchema.methods.removeToken = function (deviceToken) {
	const index = this.deviceTokens.indexOf(deviceToken);
	if (index > -1) {
		this.deviceTokens.splice(index, 1);
	}
};

const User = mongoose.model(
	stringConstants.collectionNames.USER_COLLECTION,
	userSchema
);

module.exports.User = User;

/**
 * Async and await conversion of function to
 * delete stripe customer
 */
function deleteStripeCustomer(stripeId) {
	return new Promise((resolve, reject) => {
		stripe.customers.del(stripeId, function (err, confirmation) {
			if (err) return reject(err);
			return resolve(confirmation);
		});
	});
}
