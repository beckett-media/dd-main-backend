const firebaseAdmin = require("firebase-admin");

module.exports = async function (title, body, data, deviceToken) {
  const messageObject = {
    notification: {
      title,
      body,
    },
    data,
  };

  const firebaseResponse = await firebaseAdmin
    .messaging()
    .sendToDevice(deviceToken, messageObject);

  return { firebaseResponse };
};
