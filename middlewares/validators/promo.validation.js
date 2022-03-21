const Joi = require("@hapi/joi").extend(require("@hapi/joi-date"));
Joi.objectId = require("joi-objectid")(Joi);
const { stringConstants } = require("../../utils/constants");
const { errorObjects } = require("../../utils/errorObjects");
const { createResObject } = require("../../utils/utilFunctions");

const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

module.exports = {
  createPromo: (req, res, next) => {
    const schema = Joi.object({
      name: Joi.string().required(),
      promoCode: Joi.string().required(),
      percentage: Joi.number().min(0).max(90).required(),
      listing: Joi.array().optional(),
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

  updatePromo: (req, res, next) => {
    const schema = Joi.object({
      name: Joi.string().optional(),
      promoCode: Joi.string().optional(),
      percentage: Joi.number().min(0).max(90).optional(),
      listing: Joi.array().optional(),
      enabled: Joi.boolean().optional(),
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

  getPromo: (req, res, next) => {
    const schema = Joi.object({
      promoId: Joi.required().custom(objectId),
    });

    const { error } = schema.validate(req.params);

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

  deletePromo: (req, res, next) => {
    const schema = Joi.object({
      promoId: Joi.required().custom(objectId),
    });

    const { error } = schema.validate(req.params);

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

  validatePromo: (req, res, next) => {
    console.log(req.body);
    const schema = Joi.object({
      promoCode: Joi.string().required(),
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
