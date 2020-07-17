const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");
const moment = require("moment");
const fsPromises = require("fs").promises;
const path = require("path");
const SimpleLogger = require("../utils/simpleLogger");
const rimraf = require("rimraf");
const { Card } = require("./card");
const { stringConstants } = require("../utils/constants");

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
      minlength: 5,
      maxlength: 255,
      lowercase: true,
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
    metadata: {
      signupType: {
        type: String,
        enum: [
          stringConstants.signupType.EBAY,
          stringConstants.signupType.APPLE,
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
  },
  { timestamps: true }
);

/**
 * Pre hookd to delete dependent data
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
  next();
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, role: this.role },
    config.get(stringConstants.JWT_PRIATE_KEY),
    { expiresIn: "30m" }
  );

  return {
    token,
    expiry: moment.utc(moment(Date.now()).add(30, "minutes")).format(),
  };
};

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
// "_id", "fullName", "email", "profilePicture", "username"
userSchema.methods.getUserBasicInfo = function () {
  return {
    id: this._id,
    fullName: this.fullName,
    email: this.email,
    profilePicture: this.profilePicture,
    username: this.username,
    signupType: this.metadata.signupType,
  };
};

userSchema.methods.getUserDetails = function () {
  return {
    id: this._id,
    fullName: this.fullName,
    email: this.email,
    profilePicture: this.profilePicture,
    username: this.username,
    role: this.role,
    settings: this.settings,
    signupType: this.metadata.signupType,
  };
};

userSchema.methods.isBasicInfoCompleted = function () {
  return (
    !!this.fullName && !!this.email && !!this.profilePicture && !!this.username
  );
};

userSchema.methods.addDeviceToken = function (deviceToken) {
  if (this.deviceTokens.indexOf(deviceToken) === -1) {
    this.deviceTokens.push(deviceToken);
  }
  return this.deviceTokens;
};

const User = mongoose.model(
  stringConstants.collectionNames.USER_COLLECTION,
  userSchema
);

module.exports.User = User;
