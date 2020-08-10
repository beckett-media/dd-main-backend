const jwt = require("jsonwebtoken");
const SimpleLogger = require("../utils/simpleLogger");
const config = require("config");
const { User } = require("../models/user");
const { stringConstants } = require("../utils/constants");
const { createResObject } = require("../utils/utilFunctions");
const { errorObjects } = require("../utils/errorObjects");

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
    /**
     * We will use the info in the token to verify
     * If any of the two is not defined. The token
     * is invalid and it will caught using the catch
     * block
     */
    const id = decoded._id;
    const role = decoded.role;
    /**
     * Checking is the user exists
     */
    const user = await User.findById(id);
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

    if (role !== stringConstants.role.ADMIN || role !== user.role) {
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
    //   Everything went well
    return next();
  } catch (error) {
    SimpleLogger.error(error);
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
