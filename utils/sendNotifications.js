/**
 * Since we are maintaining multiple device token
 * in database. We are going to send multicast to
 * all device tokens in the array
 */
const firebaseAdmin = require("firebase-admin");

module.exports = async function (title, body, data, deviceTokens) {
  const messageObject = {
    notification: {
      title,
      body,
    },
    data,
    tokens: deviceTokens,
  };

  const firebaseResponse = await firebaseAdmin
    .messaging()
    .sendMulticast(messageObject);
  console.log(firebaseResponse);
  return { firebaseResponse };
};
