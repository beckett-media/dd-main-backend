const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const appAuth = require("../../middlewares/authenticateApp");
const { stringConstants } = require("../../utils/constants");
const { errorObjects } = require("../../utils/errorObjects");
const { User } = require("../../models/user");
const { createResObject } = require("../../utils/utilFunctions");
const { valAdminSignIn } = require("../../middlewares/validation");

router.post("/sign-in", [appAuth, valAdminSignIn], async (req, res) => {
  const email = req.body.email.toLowerCase();
  const password = req.body.password;

  let user = await User.findOne({ email: email });
  if (!user)
    return res
      .status(404)
      .send(
        createResObject(
          false,
          {},
          stringConstants.USER_EMAIL_NOT_FOUND,
          errorObjects.USER_EMAIL_NOT_FOUND
        )
      );

  if (
    !user.password ||
    user.metadata.signupType !== stringConstants.signupType.IN_APP
  )
    return res
      .status(400)
      .send(
        createResObject(
          false,
          {},
          stringConstants.INVALID_SIGN_UP_METHOD,
          errorObjects.INVALID_SIGN_UP_METHOD(stringConstants.signupType.IN_APP)
        )
      );

  if (user.role !== stringConstants.role.ADMIN)
    return res
      .status(403)
      .send(
        createResObject(
          false,
          {},
          stringConstants.FORBIDDEN_RESOURCE,
          errorObjects.FORBIDDEN_RESOURCE
        )
      );

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid)
    return res
      .status(400)
      .send(
        createResObject(
          false,
          {},
          stringConstants.INCORRECT_PASSWORD,
          errorObjects.INCORRECT_PASSWORD
        )
      );

  const authToken = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  res.header(stringConstants.AUTH_TOKEN_STRING, authToken.token);
  res.header(stringConstants.REFRESH_TOKEN_STRING, refreshToken.token);

  const userId = user._id;
  user = await User.findByIdAndUpdate(
    userId,
    { $set: { refreshToken: refreshToken.token } },
    { new: true }
  );

  const returnObject = {
    ...user.getUserBasicInfo(),
    authTokenExpiry: authToken.expiry,
    refreshTokenExpiry: refreshToken.expiry,
    firstSignin: null,
  };

  return res.send(
    createResObject(
      true,
      { user: returnObject },
      stringConstants.SIGN_IN_SUCCESSFUL
    )
  );
});

module.exports = router;
