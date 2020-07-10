const firebaseAdmin = require("firebase-admin");

module.exports = () => {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.applicationDefault(),
  });
};
