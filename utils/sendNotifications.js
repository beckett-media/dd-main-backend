/**
 * Since we are maintaining multiple device token
 * in database. We are going to send multicast to
 * all device tokens in the array
 */
const firebaseAdmin = require("firebase-admin");
const { User } = require("../models/user");
const SimpleLogger = require("./simpleLogger");

module.exports = async function (title, body, data, deviceTokens) {
  const messageObject = {
    notification: {
      title,
      body,
    },
    data,
    tokens: deviceTokens,
  };

  let firebaseResponse;
  try {
    firebaseResponse = await firebaseAdmin
      .messaging()
      .sendMulticast(messageObject);
  } catch (error) {
    console.log(firebaseResponse);
    throw error;
  }

  console.log(firebaseResponse);
  return { firebaseResponse };
};
/**
 * Accepts two parameters the first is the user itself
 * the second is the notification object which will have
 * all the required properties that are:
 * 1. title
 * 2. body
 * 3. data
 */
module.exports.sendNotiToUser = async function (user, notification) {
  if (!user.settings.notifications) {
    SimpleLogger.info(
      `${user._id}: Not sending notification, since user has disabled notificiations`
    );
    return;
  }
  const deviceTokens = user.deviceTokens;

  const messageObject = {
    notification: {
      title: notification.title,
      body: notification.body,
    },
    data: notification.data,
    tokens: deviceTokens,
  };

  let response;

  try {
    response = await firebaseAdmin.messaging().sendMulticast(messageObject);
  } catch (error) {
    SimpleLogger.error(error);
    return;
  }

  SimpleLogger.info(JSON.stringify(response));
  return;
};
