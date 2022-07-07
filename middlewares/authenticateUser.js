const jwt = require('jsonwebtoken');
const config = require('config');
const SimpleLogger = require('../utils/simpleLogger');
const { User } = require('../models/user');
const { createResObject } = require('../utils/utilFunctions');
const { stringConstants } = require('../utils/constants');
const { errorObjects } = require('../utils/errorObjects');

module.exports = async (req, res, next) => {
  const token = req.header(stringConstants.AUTH_TOKEN_STRING);
  if (!token)
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

  try {
    const decoded = jwt.verify(
      token,
      config.get(stringConstants.JWT_PRIATE_KEY)
    );
    const role = decoded.role;
    // Check if user exists in the database, if not return from here itself
    const user = await User.findById(decoded._id);
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

    if (role !== stringConstants.role.USER || role !== user.role) {
      //   Forbidden resource
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
    }
    req.user = user;
    return next();
  } catch (ex) {
    SimpleLogger.error(ex);
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
};
