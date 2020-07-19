const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const config = require("config");
const appAuth = require("../middlewares/appAuth");
const { stringConstants } = require("../utils/constants");
const { createResObject } = require("../utils/utilFunctions");
const { errorObjects } = require("../utils/errorObjects");
const { User } = require("../models/user");
const SimpleLogger = require("../utils/simpleLogger");

router.get("/renew-auth-token", appAuth, async (req, res) => {
  let user, token, refreshToken, refreshDecoded;

  token = req.header(stringConstants.AUTH_TOKEN_STRING);
  refreshToken = req.header(stringConstants.REFRESH_TOKEN_STRING);

  if (!token) {
    return res
      .status(400)
      .send(
        createResObject(
          false,
          {},
          stringConstants.NO_AUTH_TOKEN_FOUND,
          errorObjects.NO_AUTH_TOKEN_FOUND
        )
      );
  }

  if (!refreshToken) {
    return res
      .status(400)
      .send(
        createResObject(
          false,
          {},
          stringConstants.NO_REFRESH_TOKEN_FOUND,
          errorObjects.NO_REFRESH_TOKEN_FOUND
        )
      );
  }

  try {
    user = jwt.verify(token, config.get(stringConstants.JWT_PRIATE_KEY), {
      ignoreExpiration: true,
    });
  } catch (err) {
    SimpleLogger.error(err);
    return res
      .status(401)
      .send(
        createResObject(
          false,
          {},
          stringConstants.INVALID_OR_TOKEN_EXPIRED,
          errorObjects.INVALID_OR_TOKEN_EXPIRED
        )
      );
  }

  try {
    refreshDecoded = jwt.verify(
      refreshToken,
      config.get(stringConstants.JWT_REFRESH_KEY)
    );
  } catch (err) {
    SimpleLogger.error(err);
    return res
      .status(401)
      .send(
        createResObject(
          false,
          {},
          stringConstants.REFRESH_TOKEN_INVALID_OR_EXPIRED,
          errorObjects.REFRESH_TOKEN_INVALID_OR_EXPIRED
        )
      );
  }

  user = await User.findById(user._id);
  if (!user)
    return res
      .status(404)
      .send(
        createResObject(
          false,
          {},
          stringConstants.USER_ID_DOEST_NOT_EXISTS,
          errorObjects.USER_ID_DOEST_NOT_EXISTS
        )
      );

  const savedRefreshToken = user.refreshToken;
  if (!savedRefreshToken)
    return res
      .status(404)
      .send(
        createResObject(
          false,
          {},
          stringConstants.NO_REFRESH_TOKEN_FOUND_FOR_USER,
          errorObjects.NO_REFRESH_TOKEN_FOUND_FOR_USER
        )
      );

  if (
    savedRefreshToken !== refreshToken ||
    user._id.toString() !== refreshDecoded._id
  ) {
    return res
      .status(401)
      .send(
        createResObject(
          false,
          {},
          stringConstants.REFRESH_TOKEN_INVALID_OR_EXPIRED,
          errorObjects.REFRESH_TOKEN_INVALID_OR_EXPIRED
        )
      );
  }

  token = user.generateAuthToken();
  refreshToken = user.generateRefreshToken();

  res.header(stringConstants.AUTH_TOKEN_STRING, token.token);
  res.header(stringConstants.REFRESH_TOKEN_STRING, refreshToken.token);

  const userId = user._id;
  user = await User.findByIdAndUpdate(
    userId,
    { $set: { refreshToken: refreshToken.token } },
    { new: true }
  );

  return res.send(
    createResObject(
      true,
      {
        authTokenExpiry: token.expiry,
        refreshTokenExpiry: refreshToken.expiry,
      },
      stringConstants.FETCH_SUCESSFUL
    )
  );
});

router.get("/check-auth-token", appAuth, (req, res) => {
  const token = req.header(stringConstants.AUTH_TOKEN_STRING);
  if (!token) {
    return res
      .status(400)
      .send(
        createResObject(
          false,
          {},
          stringConstants.NO_AUTH_TOKEN_FOUND,
          errorObjects.NO_AUTH_TOKEN_FOUND
        )
      );
  }

  try {
    jwt.verify(token, config.get(stringConstants.JWT_PRIATE_KEY));
  } catch (err) {
    SimpleLogger.error(err);
    return res
      .status(401)
      .send(
        createResObject(
          false,
          {},
          stringConstants.INVALID_OR_TOKEN_EXPIRED,
          errorObjects.INVALID_OR_TOKEN_EXPIRED
        )
      );
  }

  return res.send(createResObject(true, {}, stringConstants.AUTH_TOKEN_VALID));
});
module.exports = router;
