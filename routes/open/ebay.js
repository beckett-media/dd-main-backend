/**
 * Public card route accesible to general public
 */
const express = require("express");
const router = express.Router();
var crypto = require("crypto");

/**
 * Route to get all  grades
 */
router.get("/", async (req, res) => {
  console.log("EBAY DELETION NOTIFICATION RECEIVED");
  console.log(req.query);
  const hash = crypto.createHash("sha256");
  hash.update(req.query.challenge_code);
  hash.update(
    "e603444b8959164dd33e8acdc34cd3cb43d3fc6bbd06827b48724cc37eab4556"
  );
  hash.update("https://api.duedilly.co/public-ebay-notification/");
  const responseHash = hash.digest("hex");
  console.log(new Buffer.from(responseHash).toString());
  res.status(200).send({ challengeResponse: responseHash });
});
module.exports = router;
