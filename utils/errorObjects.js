const { stringConstants } = require("./constants");
const { getKey } = require("../utils/utilFunctions");

module.exports.errorObjects = {
  INVALID_OR_TOKEN_EXPIRED: {
    errorCode: 101,
    errorSubCode: getKey(
      stringConstants,
      stringConstants.INVALID_OR_TOKEN_EXPIRED
    ),
    errorMessage: stringConstants.INVALID_OR_TOKEN_EXPIRED,
  },
  USER_EMAIL_ALREADY_EXISTS: {
    errorCode: 102,
    errorSubCode: getKey(
      stringConstants,
      stringConstants.USER_EMAIL_ALREADY_EXISTS
    ),
    errorMessage: stringConstants.USER_EMAIL_ALREADY_EXISTS,
  },
  NO_AUTH_TOKEN_FOUND: {
    errorCode: 103,
    errorSubCode: getKey(stringConstants, stringConstants.NO_AUTH_TOKEN_FOUND),
    errorMessage: stringConstants.NO_AUTH_TOKEN_FOUND,
  },
  NO_REFRESH_TOKEN_FOUND: {
    errorCode: 104,
    errorSubCode: getKey(
      stringConstants,
      stringConstants.NO_REFRESH_TOKEN_FOUND
    ),
    errorMessage: stringConstants.NO_REFRESH_TOKEN_FOUND,
  },
  USER_ID_DOEST_NOT_EXISTS: {
    errorCode: 105,
    errorSubCode: getKey(
      stringConstants,
      stringConstants.USER_ID_DOEST_NOT_EXISTS
    ),
    errorMessage: stringConstants.USER_ID_DOEST_NOT_EXISTS,
  },
  REFRESH_TOKEN_INVALID_OR_EXPIRED: {
    errorCode: 106,
    errorSubCode: getKey(
      stringConstants,
      stringConstants.REFRESH_TOKEN_INVALID_OR_EXPIRED
    ),
    errorMessage: stringConstants.REFRESH_TOKEN_INVALID_OR_EXPIRED,
  },
  NO_REFRESH_TOKEN_FOUND_FOR_USER: {
    errorCode: 107,
    errorSubCode: getKey(
      stringConstants,
      stringConstants.NO_REFRESH_TOKEN_FOUND_FOR_USER
    ),
    errorMessage: stringConstants.NO_REFRESH_TOKEN_FOUND_FOR_USER,
  },
  FILE_CORRUPTED: {
    errorCode: 108,
    errorSubCode: getKey(stringConstants, stringConstants.FILE_CORRUPTED),
    errorMessage: stringConstants.FILE_CORRUPTED,
  },
  NO_FILE_FOUND: {
    errorCode: 109,
    errorSubCode: getKey(stringConstants, stringConstants.NO_FILE_FOUND),
    errorMessage: stringConstants.NO_FILE_FOUND,
  },
  FILE_TYPE_NOT_ACCEPTED: {
    errorCode: 110,
    errorSubCode: getKey(
      stringConstants,
      stringConstants.FILE_TYPE_NOT_ACCEPTED
    ),
    errorMessage: stringConstants.FILE_TYPE_NOT_ACCEPTED,
  },
  USERNAME_ALREADY_TAKEN: {
    errorCode: 111,
    errorSubCode: getKey(
      stringConstants,
      stringConstants.USERNAME_ALREADY_TAKEN
    ),
    errorMessage: stringConstants.USERNAME_ALREADY_TAKEN,
  },
  USER_EMAIL_NOT_FOUND: {
    errorCode: 112,
    errorSubCode: getKey(stringConstants, stringConstants.USER_EMAIL_NOT_FOUND),
    errorMessage: stringConstants.USER_EMAIL_NOT_FOUND,
  },
  INCORRECT_PASSWORD: {
    errorCode: 113,
    errorSubCode: getKey(stringConstants, stringConstants.INCORRECT_PASSWORD),
    errorMessage: stringConstants.INCORRECT_PASSWORD,
  },
  CARD_ID_NOT_FOUND: {
    errorCode: 114,
    errorSubCode: getKey(stringConstants, stringConstants.CARD_ID_NOT_FOUND),
    errorMessage: stringConstants.CARD_ID_NOT_FOUND,
  },

  APP_TOKEN_INVALID_OR_EXPIRED: {
    errorCode: 115,
    errorSubCode: getKey(
      stringConstants,
      stringConstants.APP_TOKEN_INVALID_OR_EXPIRED
    ),
    errorMessage: stringConstants.APP_TOKEN_INVALID_OR_EXPIRED,
  },

  INVALID_APPLE_TOKEN_OR_TOKEN_EXPIRED: {
    errorCode: 116,
    errorSubCode: getKey(
      stringConstants,
      stringConstants.INVALID_APPLE_TOKEN_OR_TOKEN_EXPIRED
    ),
    errorMessage: stringConstants.INVALID_APPLE_TOKEN_OR_TOKEN_EXPIRED,
  },

  USER_IDENTIFIER_REQUIRED: {
    errorCode: 117,
    errorSubCode: getKey(
      stringConstants,
      stringConstants.USER_IDENTIFIER_REQUIRED
    ),
    errorMessage: stringConstants.USER_IDENTIFIER_REQUIRED,
  },

  USER_IDENTIFIER_DOES_NOT_MATCH_TOKEN: {
    errorCode: 118,
    errorSubCode: getKey(
      stringConstants,
      stringConstants.USER_IDENTIFIER_DOES_NOT_MATCH_TOKEN
    ),
    errorMessage: stringConstants.USER_IDENTIFIER_DOES_NOT_MATCH_TOKEN,
  },

  APPLE_ID_DOES_NOT_MATCH_EMAIL: {
    errorCode: 119,
    errorSubCode: getKey(
      stringConstants,
      stringConstants.APPLE_ID_DOES_NOT_MATCH_EMAIL
    ),
    errorMessage: stringConstants.APPLE_ID_DOES_NOT_MATCH_EMAIL,
  },

  NOT_AUTHORIZED_TO_PERFORM_THE_ACTION: {
    errorCode: 120,
    errorSubCode: getKey(
      stringConstants,
      stringConstants.NOT_AUTHORIZED_TO_PERFORM_THE_ACTION
    ),
    errorMessage: stringConstants.NOT_AUTHORIZED_TO_PERFORM_THE_ACTION,
  },

  NO_PEDNING_CARDS_FOUND_FOR_USER: {
    errorCode: 121,
    errorSubCode: getKey(
      stringConstants,
      stringConstants.NO_PEDNING_CARDS_FOUND_FOR_USER
    ),
    errorMessage: stringConstants.NO_PEDNING_CARDS_FOUND_FOR_USER,
  },

  NO_CARDS_LEFT_IN_PLAN: {
    errorCode: 221,
    errorSubCode: getKey(
      stringConstants,
      stringConstants.NO_CARDS_LEFT_IN_PLAN
    ),
    errorMessage: stringConstants.NO_CARDS_LEFT_IN_PLAN,
  },

  AMOUNT_MISMATCH: {
    errorCode: 134,
    errorSubCode: getKey(
      stringConstants,
      stringConstants.AMOUNT_MISMATCH
    ),
    errorMessage: stringConstants.AMOUNT_MISMATCH,
  },

  PENDING_AMOUNT_AND_AMOUNT_DO_NOT_MATCH: {
    errorCode: 122,
    errorSubCode: getKey(
      stringConstants,
      stringConstants.PENDING_AMOUNT_AND_AMOUNT_DO_NOT_MATCH
    ),
    errorMessage: stringConstants.PENDING_AMOUNT_AND_AMOUNT_DO_NOT_MATCH,
  },

  EBAY_ACCESS_TOKEN_REQUIRED: {
    errorCode: 123,
    errorSubCode: getKey(
      stringConstants,
      stringConstants.EBAY_ACCESS_TOKEN_REQUIRED
    ),
    errorMessage: stringConstants.EBAY_ACCESS_TOKEN_REQUIRED,
  },

  USER_ALREADY_SIGNED_UP_WITH_DIFFERENT_METHOD: (method) => {
    return {
      errorCode: 124,
      errorSubCode: getKey(
        stringConstants,
        stringConstants.USER_ALREADY_SIGNED_UP_WITH_DIFFERENT_METHOD
      ),
      errorMessage: `${stringConstants.USER_ALREADY_SIGNED_UP_WITH_DIFFERENT_METHOD}: ${method}`,
    };
  },

  FORBIDDEN_RESOURCE: {
    errorCode: 125,
    errorSubCode: getKey(stringConstants, stringConstants.FORBIDDEN_RESOURCE),
    errorMessage: stringConstants.FORBIDDEN_RESOURCE,
  },

  INVALID_SIGN_UP_METHOD: (method) => {
    return {
      errorCode: 126,
      errorSubCode: getKey(
        stringConstants,
        stringConstants.INVALID_SIGN_UP_METHOD
      ),
      errorMessage: `${stringConstants.INVALID_SIGN_UP_METHOD}. Needs to be ${method}`,
    };
  },

  NEEDS_TO_BE_INTEGER: (valueName) => {
    return {
      errorCode: 127,
      errorSubCode: getKey(
        stringConstants,
        stringConstants.NEEDS_TO_BE_INTEGER
      ),
      errorMessage: `${valueName} ${stringConstants.NEEDS_TO_BE_INTEGER}`,
    };
  },

  TOO_MANY_REQUESTS: {
    errorCode: 128,
    errorSubCode: "TOO_MANY_REQUESTS",
    errorMessage: stringConstants.TOO_MANY_REQUESTS,
  },

  STRIPE_ERROR: (message) => {
    return {
      errorCode: 129,
      errorSubCode: "STRIPE_ERROR",
      errorMessage: message,
    };
  },

  NO_EBAY_TOKEN_FOUND: {
    errorCode: 130,
    errorSubCode: "NO_EBAY_TOKEN_FOUND",
    errorMessage: stringConstants.NO_EBAY_TOKEN_FOUND,
  },

  NO_EBAY_REFRESH_TOKEN_FOUND: {
    errorCode: 131,
    errorSubCode: "NO_EBAY_REFRESH_TOKEN_FOUND",
    errorMessage: stringConstants.NO_EBAY_REFRESH_TOKEN_FOUND,
  },

  REQUEST_VALIDATION_ERROR: (errorMessage) => {
    return {
      errorCode: 301,
      errorSubCode: "REQUEST_VALIDATION_FAILED",
      errorMessage: errorMessage,
    };
  },
  UNSUSPECTED_ERROR: (errorMessage) => {
    return {
      errorCode: 302,
      errorSubCode: getKey(stringConstants, stringConstants.UNSUSPECTED_ERROR),
      errorMessage: errorMessage,
    };
  },
  PAYMENT_ERRORED: (errorMessage) => {
    return {
      errorCode: 302,
      errorSubCode: getKey(stringConstants, stringConstants.PAYMENT_ERRORED),
      errorMessage: errorMessage,
    };
  },
  INTERNAL_SERVER_ERROR: (errorMessage) => {
    return {
      errorCode: 500,
      errorSubCode: getKey(
        stringConstants,
        stringConstants.INTERNAL_SERVER_ERROR
      ),
      errorMessage: errorMessage,
    };
  },
};
