const Joi = require("@hapi/joi").extend(require("@hapi/joi-date"));
Joi.objectId = require("joi-objectid")(Joi);
const { stringConstants } = require("../utils/constants");
const { errorObjects } = require("../utils/errorObjects");
const { createResObject } = require("../utils/utilFunctions");
const { Question } = require("../models/question");
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

  valUpdateCreditCardRequest: (req, res, next) => {
    const year = new Date().getFullYear();
    const schema = Joi.object({
      cardId: Joi.string().required(),
      expMonth: Joi.number().required().min(1).max(12),
      expYear: Joi.number().required().min(year).max(9999),
      fullName: Joi.string().required().min(2).max(255),
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

  valEbayOAuthTokenReq: (req, res, next) => {
    const schema = Joi.object({
      code: Joi.string().required(),
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

  valSignInWithEbay: (req, res, next) => {
    const accessToken = req.header(stringConstants.EBAY_ACCESS_TOKEN);

    if (!accessToken)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.EBAY_ACCESS_TOKEN_REQUIRED,
            errorObjects.EBAY_ACCESS_TOKEN_REQUIRED
          )
        );

    const schema = Joi.object({
      fullName: Joi.string().required().min(2).max(255),
      email: Joi.string().email().required().min(5).max(255),
      accountType: Joi.string()
        .valid(
          stringConstants.ebayAccType.BUSINESS_ACCOUNT,
          stringConstants.ebayAccType.INDIVIDUAL_ACCOUNT
        )
        .required(),
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
  valSignOutReq: (req, res, next) => {
    const schema = Joi.object({
      deviceToken: Joi.string().required(),
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
  valAdminSignIn: (req, res, next) => {
    const schema = Joi.object({
      email: Joi.string().email().required().min(5).max(255),
      password: Joi.string().required().min(6).max(255),
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

  valPayPenReq: (req, res, next) => {
    const schema = Joi.object({
      amount: Joi.number().required(),
      paymentMethod: Joi.string().required(),
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
  valCardGradeReq: async (req, res, next) => {
    const questions = await Question.find({})
      .lean()
      .select({ maxPoints: 1, minPoints: 1, options: 1 });

    const singedCeleb = questions.find((q) => {
      return q._id === stringConstants.gradingQId.SIGNED_CELEB;
    });

    const signedAcceptedVals = singedCeleb.options.map((opt) => {
      return opt.points;
    });

    const cornerValue = questions.find((q) => {
      return q._id === stringConstants.gradingQId.CORNER_VALUE;
    });
    const cornerAcceptedVals = cornerValue.options.map((opt) => {
      return opt.points;
    });

    const edgeValue = questions.find((q) => {
      return q._id === stringConstants.gradingQId.EDGE_VALUE;
    });

    const edgeAcceptedVals = edgeValue.options.map((opt) => {
      return opt.points;
    });

    const surfaceValue = questions.find((q) => {
      return q._id === stringConstants.gradingQId.SURFACE_VALUE;
    });

    const surfaceAcceptedVals = surfaceValue.options.map((opt) => {
      return opt.points;
    });

    const eyeAppeal = questions.find((q) => {
      return q._id === stringConstants.gradingQId.EYE_APPEAL;
    });

    const eyeAcceptedVals = eyeAppeal.options.map((opt) => {
      return opt.points;
    });

    const centerFront = questions.find((q) => {
      return q._id === stringConstants.gradingQId.CENTER_FRONT;
    });

    const centerFrontAcceptedVals = centerFront.options.map((opt) => {
      return opt.points;
    });

    const centerBack = questions.find((q) => {
      return q._id === stringConstants.gradingQId.CENTER_BACK;
    });

    const centerBackAcceptedVals = centerBack.options.map((opt) => {
      return opt.points;
    });

    const cardStains = questions.find((q) => {
      return q._id === stringConstants.gradingQId.CARD_STAINS;
    });

    const cardStainsAccpetedVals = cardStains.options.map((opt) => {
      return opt.points;
    });

    const cardSleeving = questions.find((q) => {
      return q._id === stringConstants.gradingQId.CARD_SLEEVING;
    });

    const cardSleevingAcceptedVals = cardSleeving.options.map((opt) => {
      return opt.points;
    });

    const printingDefects = questions.find((q) => {
      return q._id === stringConstants.gradingQId.PRINTING_DEFECTS;
    });

    const printingDefectsAcceptedVals = printingDefects.options.map((opt) => {
      return opt.points;
    });

    const schema = Joi.object({
      cardId: Joi.objectId().required(),
      signedCeleb: Joi.number()
        .required()
        .valid(...signedAcceptedVals)
        .min(singedCeleb.minPoints)
        .max(singedCeleb.maxPoints),
      cornerValue: Joi.number()
        .required()
        .valid(...cornerAcceptedVals)
        .min(cornerValue.minPoints)
        .max(cornerValue.maxPoints),
      edgeValue: Joi.number()
        .required()
        .valid(...edgeAcceptedVals)
        .min(edgeValue.minPoints)
        .max(edgeValue.maxPoints),
      surfaceValue: Joi.number()
        .required()
        .valid(...surfaceAcceptedVals)
        .min(surfaceValue.minPoints)
        .max(surfaceValue.maxPoints),
      eyeAppeal: Joi.number()
        .required()
        .valid(...eyeAcceptedVals)
        .min(eyeAppeal.minPoints)
        .max(eyeAppeal.maxPoints),
      centerFront: Joi.number()
        .required()
        .valid(...centerFrontAcceptedVals)
        .min(centerFront.minPoints)
        .max(centerFront.maxPoints),
      centerBack: Joi.number()
        .required()
        .valid(...centerBackAcceptedVals)
        .min(centerBack.minPoints)
        .max(centerBack.maxPoints),
      cardStains: Joi.number()
        .required()
        .valid(...cardSleevingAcceptedVals)
        .min(cardStains.minPoints)
        .max(cardStains.maxPoints),
      cardSleeving: Joi.number()
        .required()
        .valid(...cardSleevingAcceptedVals)
        .min(cardSleeving.minPoints)
        .max(cardSleeving.maxPoints),
      printingDefects: Joi.number()
        .required()
        .valid(...printingDefectsAcceptedVals)
        .min(printingDefects.minPoints)
        .max(printingDefects.maxPoints),
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
};
