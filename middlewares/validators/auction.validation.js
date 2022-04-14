const Joi = require("@hapi/joi").extend(require("@hapi/joi-date"));
Joi.objectId = require("joi-objectid")(Joi);
const { stringConstants } = require("../../utils/constants");
const { errorObjects } = require("../../utils/errorObjects");
const { createResObject } = require("../../utils/utilFunctions");

module.exports = {
  valCreateAuction: (req, res, next) => {
    const schema = Joi.object({
      listingId: Joi.objectId().required(),
      startNow: Joi.boolean().required(),
      bidStart: Joi.date().optional(),
      bidEnd: Joi.date().required(),
      startingBid: Joi.number().required(),
    });

    const { error } = schema.validate(req.body);

    if (error)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            { errorMessage: error.details[0].message },
            stringConstants.REQUEST_VALIDATION_FAILED,
            errorObjects.REQUEST_VALIDATION_ERROR(error.details[0].message)
          )
        );
    return next();
  },

  valUpdateAuction: (req, res, next) => {
    const schema = Joi.object({
      bidStart: Joi.date().optional(),
      bidEnd: Joi.date().required(),
      startingBid: Joi.number().required(),
    });

    const { error } = schema.validate(req.body);

    if (error)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            { errorMessage: error.details[0].message },
            stringConstants.REQUEST_VALIDATION_FAILED,
            errorObjects.REQUEST_VALIDATION_ERROR(error.details[0].message)
          )
        );
    return next();
  },
};
