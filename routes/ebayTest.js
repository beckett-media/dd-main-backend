/**
 * Test routes for testing ebay auth.
 */
const got = require("got");
const express = require("express");
const router = express.Router();
const SimpleLogger = require("../utils/simpleLogger");
const ClientID = "AnuragSi-DCGS-SBX-ac8ec7f0e-92710ddc";
const ClientSecret = "SBX-c8ec7f0e11f2-4787-4b71-a936-0a8d";

router.get("/ebay-accepted", async (req, res) => {
  SimpleLogger.info(req.query.code, req.query.expires_in);
  const authorizationString = `${ClientID}:${ClientSecret}`;
  const authorization = Buffer.from(authorizationString).toString("base64");
  try {
    const { body } = await got.post(
      "https://api.sandbox.ebay.com/identity/v1/oauth2/token",
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${authorization}`,
        },
        form: {
          grant_type: "authorization_code",
          code: req.query.code,
          redirect_uri: "Anurag_Singla-AnuragSi-DCGS-S-sqsppiy",
        },
        responseType: "json",
      }
    );
    SimpleLogger.info(body);
    console.log("Body", body);
  } catch (error) {
    SimpleLogger.error(error);
  }

  return res.send("Accepted");
});

router.get("/ebay-declined", (req, res) => {
  SimpleLogger.info(req.query.code, req.query.expires_id);
  return res.send("Declined");
});

module.exports = router;
