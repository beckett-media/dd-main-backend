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
