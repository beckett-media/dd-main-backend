const Joi = require("@hapi/joi").extend(require("@hapi/joi-date"));
Joi.objectId = require("joi-objectid")(Joi);
const { stringConstants } = require("../../../utils/constants");
const { errorObjects } = require("../../../utils/errorObjects");
const { createResObject } = require("../../../utils/utilFunctions");

const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

module.exports = {
  changeIndexOfCardSortList: (req, res, next) => {
    const schemaParam = Joi.object({
      cardId: Joi.required().custom(objectId),
    });

    const schemaBody = Joi.object({
      toIndex: Joi.number().min(0).required(),
    });

    let { error } = schemaParam.validate(req.params);

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

    ({ error } = schemaBody.validate(req.body));

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
