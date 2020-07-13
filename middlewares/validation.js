const Joi = require("@hapi/joi").extend(require("@hapi/joi-date"));
Joi.objectId = require("joi-objectid")(Joi);
const { stringConstants } = require("../utils/constants");
const { errorObjects } = require("../utils/errorObjects");
const { createResObject } = require("../utils/utilFunctions");

module.exports = {
  /**
   * Function to validate for mongoose object ID
   */
  valObjectIdInUrl: (req, res, next) => {
    const schema = Joi.object({
      id: Joi.objectId(),
    });

    const { error } = schema.validate({ id: req.params.id });

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
  valRegisterRequest: (req, res, next) => {
    const schema = Joi.object({
      fullName: Joi.string().required().min(2).max(255),
      email: Joi.string().email().required().min(5).max(255),
      password: Joi.string().required().min(6).max(255),
      osType: Joi.string()
        .valid(
          stringConstants.osType.ANDROID,
          stringConstants.osType.iOS,
          stringConstants.osType.LINUX,
          stringConstants.osType.MAC_OS,
          stringConstants.osType.WINDOWS
        )
        .required(),
      deviceToken: Joi.string().required(),
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

  valUsernameRequest: (req, res, next) => {
    const schema = Joi.object({
      username: Joi.string().required().min(5).max(255),
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

  valSignInRequest: (req, res, next) => {
    const schema = Joi.object({
      email: Joi.string().email().required().min(5).max(255),
      password: Joi.string().required().min(6).max(1024),
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

  valUpdateCreditCardRequest: (req, res, next) => {
    const year = new Date().getFullYear();
    const schema = Joi.object({
      cardId: Joi.string().required(),
      expMonth: Joi.number().required().min(1).max(12),
      expYear: Joi.number().required().min(year).max(9999),
      fullName: Joi.string().required(),
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

  valChangePasswordRequest: (req, res, next) => {
    const schema = Joi.object({
      newPassword: Joi.string().required().min(6).max(255),
      oldPassword: Joi.string().required().min(6).max(255),
    });

    const { error } = schema.validate(req.body);
    if (error) {
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
    }
    return next();
  },

  valUpdateCardData: (req, res, next) => {
    const currentYear = new Date().getFullYear();
    const schema = Joi.object({
      year: Joi.number().required().min(1000).max(currentYear),
      brand: Joi.string().required().min(1).max(255),
      cardNumber: Joi.number().required().min(0),
      playerNames: Joi.array().items(Joi.string().required()).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
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
    }
    return next();
  },

  valPageSizeNumber: (req, res, next) => {
    const schema = Joi.object({
      pageSize: Joi.number().required().min(1),
      pageNumber: Joi.number().required().min(1),
    });

    const obj = {
      pageSize: req.params.pageSize,
      pageNumber: req.params.pageNumber,
    };

    const { error } = schema.validate(obj);
    if (error) {
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
    }
    return next();
  },
};
