/**
 * Test routes for testing ebay auth.
 */
const got = require("got");
const express = require("express");
const router = express.Router();
const config = require("config");
const appAuth = require("../middlewares/appAuth");
const SimpleLogger = require("../utils/simpleLogger");
const { stringConstants } = require("../utils/constants");
const { createResObject } = require("../utils/utilFunctions");
const { errorObjects } = require("../utils/errorObjects");
const { valEbayOAuthTokenReq } = require("../middlewares/validation");

/**
 * Redirect route once user accepts the terms and conditions
 * for eBay. Render page in the future.
 */
router.get("/ebay-accepted", async (req, res) => {
  const clientId = config.get(stringConstants.EBAY_CLIENT_ID);
  const clientSecret = config.get(stringConstants.EBAY_CLIENT_SECRET);
  const authorizationString = `${clientId}:${clientSecret}`;
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
    SimpleLogger.info(body.access_token);
    SimpleLogger.info(body.refresh_token);
    console.log("Body", body);
  } catch (error) {
    SimpleLogger.error(error);
  }

  return res.send("Accepted");
});

/**
 * Redirect URL for if user declines to accept the terms and conditions.
 * Render a page in future.
 */
router.get("/ebay-declined", (req, res) => {
  SimpleLogger.info(req.query.code, req.query.expires_id);
  return res.send("Declined");
});

/**
 * Takes the code and returns the oAuth access token
 * in return
 */
router.get("/ebay-get-oauth", [appAuth], async (req, res) => {
  const code = req.query.code;
  if (!code)
    return res
      .status(400)
      .send(
        createResObject(
          false,
          {},
          stringConstants.UNSUSPECTED_ERROR,
          errorObjects.UNSUSPECTED_ERROR("Query parameter code is required")
        )
      );
  const clientId = config.get(stringConstants.EBAY_CLIENT_ID);
  const clientSecret = config.get(stringConstants.EBAY_CLIENT_SECRET);
  const authorizationString = `${clientId}:${clientSecret}`;
  const authorization = Buffer.from(authorizationString).toString("base64");

  try {
    const { body } = await got.post(stringConstants.URLS.ebayoAuthUrl, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${authorization}`,
      },
      form: {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: "Anurag_Singla-AnuragSi-DCGS-S-sqsppiy",
      },
      responseType: "json",
    });
    let returnObject = {};
    res.header("ebay-access-token") = body.access_token;
    res.header("ebay-refresh-token") = body.refresh_token;

    returnObject.accessTokenExpiry = body.expires_in;
    returnObject.refreshTokenExpiry = body.refresh_token_expires_in;

    return res.send(
      createResObject(true, returnObject, stringConstants.FETCH_SUCESSFUL)
    );
  } catch (error) {
    SimpleLogger.error(error);
    return res
      .status(400)
      .send(
        createResObject(
          false,
          {},
          stringConstants.UNSUSPECTED_ERROR,
          errorObjects.UNSUSPECTED_ERROR(error.message)
        )
      );
  }
});
module.exports = router;
