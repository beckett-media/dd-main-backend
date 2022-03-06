const jwt = require("jsonwebtoken");
const config = require("config");
const SimpleLogger = require("../utils/simpleLogger");
const { User } = require("../models/user");
const { stringConstants } = require("../utils/constants");

module.exports = async (token) => {
  if (!token)
    return {
      status: false,
      user: null,
      message: "Invalid or Expired Token. Try after login again",
    };

  try {
    const decoded = jwt.verify(
      token,
      config.get(stringConstants.JWT_PRIATE_KEY)
    );
    const role = decoded.role;

    const user = await User.findById(decoded._id);
    if (!user) return { status: false, user: null, message: "User not exist" };

    if (role !== stringConstants.role.USER || role !== user.role)
      return { status: false, user: null, message: "Forbidden Resource" };

    return { status: true, user, message: "Auth Successfull" };
  } catch (ex) {
    SimpleLogger.error(ex);
    return { status: false, user: null, message: "Invalid or Expired Token" };
  }
};
