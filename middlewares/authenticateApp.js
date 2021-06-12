const jwt = require("jsonwebtoken");
const config = require("config");
const SimpleLogger = require("../utils/simpleLogger");
const { createResObject } = require("../utils/utilFunctions");
const { stringConstants } = require("../utils/constants");
const { errorObjects } = require("../utils/errorObjects");

module.exports = (req, res, next) => {
	const token = req.header(stringConstants.APP_TOKEN_STRING);
	if (!token) {
		return res
			.status(401)
			.send(
				createResObject(
					false,
					{},
					stringConstants.APP_TOKEN_INVALID_OR_EXPIRED,
					errorObjects.APP_TOKEN_INVALID_OR_EXPIRED
				)
			);
	}

	try {
		// jwt.verify(token, config.get(stringConstants.JWT_APP_KEY), {
		//   ignoreExpiration: true,
		// });
		return next();
	} catch (error) {
		SimpleLogger.error(error);
		return res
			.status(401)
			.send(
				createResObject(
					false,
					{},
					stringConstants.APP_TOKEN_INVALID_OR_EXPIRED,
					errorObjects.APP_TOKEN_INVALID_OR_EXPIRED
				)
			);
	}
};
