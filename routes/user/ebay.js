/**
 * Test routes for testing ebay auth.
 */
const got = require("got");
const express = require("express");
const router = express.Router();
const config = require("config");
const appAuth = require("../../middlewares/authenticateApp");
const SimpleLogger = require("../../utils/simpleLogger");
const { stringConstants } = require("../../utils/constants");
const { createResObject } = require("../../utils/utilFunctions");
const { errorObjects } = require("../../utils/errorObjects");
const { valEbayOAuthTokenReq } = require("../../middlewares/validation");

/**
 * Redirect route once user accepts the terms and conditions
 * for eBay. Render page in the future.
 */
router.get("/ebay-accepted", async (req, res) => {
  SimpleLogger.info(req.query.code);

  return res.render("ebay", { accepted: true });
});

/**
 * Redirect URL for if user declines to accept the terms and conditions.
 * Render a page in future.
 */
router.get("/ebay-declined", (req, res) => {
  SimpleLogger.info(req.query.code, req.query.expires_id);
  return res.render("ebay", { accepted: false });
});

/**
 * Takes the code and returns the oAuth access token
 * in return
 */
router.get("/ebay-get-oauth", appAuth, async (req, res) => {
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
  const token = `Basic ${authorization}`;

  try {
    const { body } = await got.post(
      config.get(stringConstants.ebayUrlNames.EBAY_O_AUTH),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: token,
        },
        form: {
          grant_type: "authorization_code",
          code: code,
          redirect_uri: config.get('eBayClientId')
        },
        responseType: "json",
      }
    );
    let returnObject = {};
    res.header(stringConstants.EBAY_ACCESS_TOKEN, body.access_token);
    res.header(stringConstants.EBAY_REFRESH_TOKEN, body.refresh_token);

    returnObject.accessTokenExpiry = body.expires_in || null;
    returnObject.refreshTokenExpiry = body.refresh_token_expires_in || null;

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

router.get("/ebay-refresh-token", appAuth, async (req, res) => {
  const ebayAccessToken = req.get(
    stringConstants.headerNames.EBAY_ACCESS_TOKEN
  );
  if (!ebayAccessToken)
    return res
      .status(401)
      .send(
        createResObject(
          false,
          {},
          stringConstants.NO_EBAY_TOKEN_FOUND,
          errorObjects.NO_EBAY_TOKEN_FOUND
        )
      );

  const ebayRefreshToken = req.get(
    stringConstants.headerNames.EBAY_REFRESH_TOKEN
  );

  if (!ebayRefreshToken)
    return res
      .status(401)
      .send(
        createResObject(
          false,
          {},
          stringConstants.NO_EBAY_REFRESH_TOKEN_FOUND,
          errorObjects.NO_EBAY_REFRESH_TOKEN_FOUND
        )
      );

  const clientId = config.get(stringConstants.EBAY_CLIENT_ID);
  const clientSecret = config.get(stringConstants.EBAY_CLIENT_SECRET);
  const authorizationString = `${clientId}:${clientSecret}`;
  const authorization = Buffer.from(authorizationString).toString("base64");
  const token = `Basic ${authorization}`;

  try {
    const { body } = await got.post(
      config.get(stringConstants.ebayUrlNames.EBAY_REFRESH_TOKEN),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: token,
        },
        form: {
          grant_type: "refresh_token",
          refresh_token: ebayRefreshToken,
          scope: "https://api.ebay.com/oauth/api_scope/sell.item.draft",
        },
        responseType: "json",
      }
    );
    return res.send(
      createResObject(true, body, stringConstants.FETCH_SUCESSFUL)
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
