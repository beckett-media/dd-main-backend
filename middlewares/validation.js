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
      claimStoreId: Joi.string(),
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
      address_city: Joi.string().max(255).allow(null).allow(''),
      address_country: Joi.string().max(255).allow(null).allow(''),
      address_line1: Joi.string().max(255).allow(null).allow(''),
      address_line2: Joi.string().max(255).allow(null).allow(''),
      address_state: Joi.string().max(255).allow(null).allow(''),
      address_zip: Joi.string().max(255).allow(null).allow('')
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

  valNewPasswordRequest: (req, res, next) => {
    const schema = Joi.object({
      newPassword: Joi.string().required().min(6).max(255),
      email: Joi.string().required(),
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

  valVerifyOtp: (req, res, next) => {
    const schema = Joi.object({
      email: Joi.string().required(),
      otp: Joi.string().required().min(6),
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
      playerNames: Joi.array().items(Joi.string().required()).required(),
      modelNo: Joi.string().min(1).max(255),
      cardType: Joi.string().min(1).max(255),
      cardNumber: Joi.string().min(1).max(255),
      serialNo: Joi.string().min(1).max(255),
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
  valPaySubReq: (req, res, next) => {
    const schema = Joi.object({
      amount: Joi.number().required(),
      subscriptionId: Joi.string().required(),
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
  valPayStripeReq: (req, res, next) => {
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
  valCard: (req, res, next) => {
    const schema = Joi.object({
      cardId: Joi.string().required(),
    });

    const { error } = schema.validate(req.params);
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
  valCardPost: (req, res, next) => {
    const schema = Joi.object({
      cardId: Joi.string().required(),
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
        .valid(...cardStainsAccpetedVals)
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
  valLisitngCardData: (req, res, next) => {
    const year = new Date().getFullYear();
    const schema = Joi.object({
      title: Joi.string().required().min(1).max(255),
      description: Joi.string().required().min(1).max(500),
      quantity: Joi.number().required().min(1),
      price: Joi.number().required().min(1),
      cardId: Joi.string().allow(""),
      productId: Joi.string().required(),
      store: Joi.string().allow(""),
      productOptionId: Joi.string().allow(""),
      gradeId: Joi.string().required(),
      condition: Joi.string().required(),
      serialNumber: Joi.string().allow(""),
      tags: Joi.allow(""),
      isPublic: Joi.required(),
      playerNames: Joi.allow(""),
      cardType: Joi.string().required(),
      sport: Joi.string().required(),
      cardNumber: Joi.allow(""),
      year: Joi.number().min(1000).max(9999).required(),
      brand: Joi.string().required(),
      modelNo: Joi.allow(""),
      images: Joi.allow(""),
      auctionId: Joi.string().allow(""),
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
  valStoreData: (req, res, next) => {
    const schema = Joi.object({
      title: Joi.string().required().min(1).max(255),
      description: Joi.string().required().min(1).max(500),
      email: Joi.string().email().required().min(5).max(255),
      phoneNumber: Joi.string().min(5).max(15),
      address: Joi.string().min(5).max(500),
      isPublic: Joi.required(),
      images: Joi.allow(""),
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
  valAddress: (req, res, next) => {
    const schema = Joi.object({
      fullName: Joi.string().required().min(1).max(255),
      countryCode: Joi.string()
        .pattern(/^(\+?\d{1,3}|\d{1,4})$/)
        .required(),
      mobile: Joi.string()
        .length(10)
        .pattern(/^[0-9]+$/)
        .required(),
      streetAddress: Joi.string().required().min(1).max(250),
      streetAddress2: Joi.string().allow("").min(1).max(250),
      city: Joi.string().required().min(1).max(50),
      state: Joi.string().required().min(1).max(50),
      zipcode: Joi.string()
        .pattern(/^([0-9]{5})(?:[-\s]*([0-9]{4}))?$/)
        .required(),
      isDefaultAddress: Joi.boolean(),
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
  addCart: (req, res, next) => {
    const schema = Joi.object({
      quantity: Joi.number().required().min(1),
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
  valBlogPress: (req, res, next) => {
    const schema = Joi.object({
      title: Joi.string().required().min(5).max(60),
      data: Joi.string().allow(null).allow(""),
      bannerImage: Joi.binary().optional().allow(null),
      type: Joi.string().valid("blog", "press").required(),
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
  valBlogPressUpdate: (req, res, next) => {
    const schema = Joi.object({
      title: Joi.string().required().min(5).max(60),
      data: Joi.string().allow(null).allow(""),
      bannerImage: Joi.optional(),
      type: Joi.string().valid("blog", "press").required(),
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
  valPostTypeInUrl: (req, res, next) => {
    const schema = Joi.object({
      type: Joi.string().valid("blog", "press").required(),
    });

    const { error } = schema.validate({ type: req.params.type });

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
