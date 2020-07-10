const got = require("got");
const jwksClient = require("jwks-rsa");
const jwt = require("jsonwebtoken");
const SimpleLogger = require("../utils/simpleLogger");
const { stringConstants } = require("../utils/constants");
const { createResObject } = require("../utils/utilFunctions");
const { errorObjects } = require("../utils/errorObjects");

module.exports = async function (req, res, next) {
  // Check to see if token in header
  const appleToken = req.header(stringConstants.APPLE_TOKEN_STRING);
  if (!appleToken)
    return res
      .status(401)
      .send(
        createResObject(
          false,
          {},
          stringConstants.INVALID_APPLE_TOKEN_OR_TOKEN_EXPIRED,
          errorObjects.INVALID_APPLE_TOKEN_OR_TOKEN_EXPIRED
        )
      );

  let header, response, result;

  try {
    header = jwt.decode(appleToken, { complete: true }).header;
  } catch (ex) {
    SimpleLogger.error(ex);
    return res
      .status(401)
      .send(
        createResObject(
          false,
          {},
          stringConstants.INVALID_APPLE_TOKEN_OR_TOKEN_EXPIRED,
          errorObjects.INVALID_APPLE_TOKEN_OR_TOKEN_EXPIRED
        )
      );
  }

  //   Get list of public keys from Apple. Using to get the alogrithm for KID
  try {
    response = await got(stringConstants.APPLE_PUBLIC_KEY_URL, {
      responseType: "json",
    });
    if (response.statusCode !== 200) {
      throw new Error(stringConstants.FAILED_TO_FETCH_APPLE_PUBLIC_KEYS);
    }
  } catch (ex) {
    SimpleLogger.error(ex);
    return next(ex);
  }

  //   Get KID for public key
  const kid = header.kid;
  if (!kid) {
    SimpleLogger.error(new Error(stringConstants.NO_KID_FOUND_IN_HEADER));
    return res
      .status(401)
      .send(
        createResObject(
          false,
          {},
          stringConstants.INVALID_APPLE_TOKEN_OR_TOKEN_EXPIRED,
          errorObjects.INVALID_APPLE_TOKEN_OR_TOKEN_EXPIRED
        )
      );
  }

  result = response.body.keys.find((obj) => {
    return (obj.kid = kid);
  });

  if (!result)
    return next(new Error(stringConstants.NO_KID_FOUND_IN_APPLE_PUBLIC_KEYS));

  const alg = result.alg;
  let signingKey;

  try {
    signingKey = await getSigningKey(kid);
  } catch (ex) {
    SimpleLogger.error(ex);
    return next(ex);
  }

  try {
    const payload = await verifyToken(appleToken, signingKey, alg);
    if (!req.body.userIdentifier) {
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.USER_IDENTIFIER_REQUIRED,
            errorObjects.USER_IDENTIFIER_REQUIRED
          )
        );
    }

    if (req.body.userIdentifier !== payload.sub) {
      return res
        .status(401)
        .send(
          createResObject(
            false,
            {},
            stringConstants.USER_IDENTIFIER_DOES_NOT_MATCH_TOKEN,
            errorObjects.USER_IDENTIFIER_DOES_NOT_MATCH_TOKEN
          )
        );
    }

    req.payload = payload;
    next();
  } catch (ex) {
    SimpleLogger.error(ex);
    return res
      .status(401)
      .send(
        createResObject(
          false,
          {},
          stringConstants.INVALID_APPLE_TOKEN_OR_TOKEN_EXPIRED,
          errorObjects.INVALID_APPLE_TOKEN_OR_TOKEN_EXPIRED
        )
      );
  }
};

function getSigningKey(kid) {
  const client = jwksClient({
    jwksUri: stringConstants.APPLE_PUBLIC_KEY_URL,
  });

  return new Promise((resolve, reject) => {
    client.getSigningKey(kid, (err, key) => {
      if (err) return reject(err);
      resolve(key.getPublicKey());
    });
  });
}

function verifyToken(token, signingKey, alg) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, signingKey, { algorithms: alg }, (err, payload) => {
      if (err) return reject(err);
      resolve(payload);
    });
  });
}
