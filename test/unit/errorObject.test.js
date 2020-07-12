const { errorObjects } = require("../../utils/errorObjects");
const { stringConstants } = require("../../utils/constants");
const testMessage = "Test message";
const chai = require("chai");
const expect = chai.expect;

describe("Error object fucntion tests", function () {
  it("Should return error object with error code 301", function () {
    const result = errorObjects.REQUEST_VALIDATION_ERROR(testMessage);
    expect(result).to.be.eql({
      errorCode: 301,
      errorSubCode: "REQUEST_VALIDATION_FAILED",
      errorMessage: testMessage,
    });
  });

  it("Should return error object with error code 302", function () {
    const result = errorObjects.UNSUSPECTED_ERROR(testMessage);
    expect(result).to.be.eql({
      errorCode: 302,
      errorSubCode: "UNSUSPECTED_ERROR",
      errorMessage: testMessage,
    });
  });

  it("Should return error object with error code 500", function () {
    const result = errorObjects.INTERNAL_SERVER_ERROR(testMessage);
    expect(result).to.be.eql({
      errorCode: 500,
      errorSubCode: "INTERNAL_SERVER_ERROR",
      errorMessage: testMessage,
    });
  });

  it("Should return error object with error code 101", function () {
    const result = errorObjects.INVALID_OR_TOKEN_EXPIRED;
    expect(result).to.be.eql({
      errorCode: 101,
      errorSubCode: "INVALID_OR_TOKEN_EXPIRED",
      errorMessage: stringConstants.INVALID_OR_TOKEN_EXPIRED,
    });
  });
  it("Should return error object with error code 102", function () {
    const result = errorObjects.USER_EMAIL_ALREADY_EXISTS;
    expect(result).to.be.eql({
      errorCode: 102,
      errorSubCode: "USER_EMAIL_ALREADY_EXISTS",
      errorMessage: stringConstants.USER_EMAIL_ALREADY_EXISTS,
    });
  });
  it("Should return error object with error code 103", function () {
    const result = errorObjects.NO_AUTH_TOKEN_FOUND;
    expect(result).to.be.eql({
      errorCode: 103,
      errorSubCode: "NO_AUTH_TOKEN_FOUND",
      errorMessage: stringConstants.NO_AUTH_TOKEN_FOUND,
    });
  });
  it("Should return error object with error code 104", function () {
    const result = errorObjects.NO_REFRESH_TOKEN_FOUND;
    expect(result).to.be.eql({
      errorCode: 104,
      errorSubCode: "NO_REFRESH_TOKEN_FOUND",
      errorMessage: stringConstants.NO_REFRESH_TOKEN_FOUND,
    });
  });
  it("Should return error object with error code 105", function () {
    const result = errorObjects.USER_ID_DOEST_NOT_EXISTS;
    expect(result).to.be.eql({
      errorCode: 105,
      errorSubCode: "USER_ID_DOEST_NOT_EXISTS",
      errorMessage: stringConstants.USER_ID_DOEST_NOT_EXISTS,
    });
  });
  it("Should return error object with error code 106", function () {
    const result = errorObjects.REFRESH_TOKEN_INVALID_OR_EXPIRED;
    expect(result).to.be.eql({
      errorCode: 106,
      errorSubCode: "REFRESH_TOKEN_INVALID_OR_EXPIRED",
      errorMessage: stringConstants.REFRESH_TOKEN_INVALID_OR_EXPIRED,
    });
  });
  it("Should return error object with error code 107", function () {
    const result = errorObjects.NO_REFRESH_TOKEN_FOUND_FOR_USER;
    expect(result).to.be.eql({
      errorCode: 107,
      errorSubCode: "NO_REFRESH_TOKEN_FOUND_FOR_USER",
      errorMessage: stringConstants.NO_REFRESH_TOKEN_FOUND_FOR_USER,
    });
  });
  it("Should return error object with error code 108", function () {
    const result = errorObjects.FILE_CORRUPTED;
    expect(result).to.be.eql({
      errorCode: 108,
      errorSubCode: "FILE_CORRUPTED",
      errorMessage: stringConstants.FILE_CORRUPTED,
    });
  });
  it("Should return error object with error code 109", function () {
    const result = errorObjects.NO_FILE_FOUND;
    expect(result).to.be.eql({
      errorCode: 109,
      errorSubCode: "NO_FILE_FOUND",
      errorMessage: stringConstants.NO_FILE_FOUND,
    });
  });
  it("Should return error object with error code 110", function () {
    const result = errorObjects.FILE_TYPE_NOT_ACCEPTED;
    expect(result).to.be.eql({
      errorCode: 110,
      errorSubCode: "FILE_TYPE_NOT_ACCEPTED",
      errorMessage: stringConstants.FILE_TYPE_NOT_ACCEPTED,
    });
  });
  it("Should return error object with error code 111", function () {
    const result = errorObjects.USERNAME_ALREADY_TAKEN;
    expect(result).to.be.eql({
      errorCode: 111,
      errorSubCode: "USERNAME_ALREADY_TAKEN",
      errorMessage: stringConstants.USERNAME_ALREADY_TAKEN,
    });
  });
  it("Should return error object with error code 112", function () {
    const result = errorObjects.USER_EMAIL_NOT_FOUND;
    expect(result).to.be.eql({
      errorCode: 112,
      errorSubCode: "USER_EMAIL_NOT_FOUND",
      errorMessage: stringConstants.USER_EMAIL_NOT_FOUND,
    });
  });
  it("Should return error object with error code 113", function () {
    const result = errorObjects.INCORRECT_PASSWORD;
    expect(result).to.be.eql({
      errorCode: 113,
      errorSubCode: "INCORRECT_PASSWORD",
      errorMessage: stringConstants.INCORRECT_PASSWORD,
    });
  });
  it("Should return error object with error code 114", function () {
    const result = errorObjects.CARD_ID_NOT_FOUND;
    expect(result).to.be.eql({
      errorCode: 114,
      errorSubCode: "CARD_ID_NOT_FOUND",
      errorMessage: stringConstants.CARD_ID_NOT_FOUND,
    });
  });
  it("Should return error object with error code 115", function () {
    const result = errorObjects.APP_TOKEN_INVALID_OR_EXPIRED;
    expect(result).to.be.eql({
      errorCode: 115,
      errorSubCode: "APP_TOKEN_INVALID_OR_EXPIRED",
      errorMessage: stringConstants.APP_TOKEN_INVALID_OR_EXPIRED,
    });
  });

  it("Should return error object with error code 116", function () {
    const result = errorObjects.INVALID_APPLE_TOKEN_OR_TOKEN_EXPIRED;
    expect(result).to.be.eql({
      errorCode: 116,
      errorSubCode: "INVALID_APPLE_TOKEN_OR_TOKEN_EXPIRED",
      errorMessage: stringConstants.INVALID_APPLE_TOKEN_OR_TOKEN_EXPIRED,
    });
  });
  it("Should return error object with error code 117", function () {
    const result = errorObjects.USER_IDENTIFIER_REQUIRED;
    expect(result).to.be.eql({
      errorCode: 117,
      errorSubCode: "USER_IDENTIFIER_REQUIRED",
      errorMessage: stringConstants.USER_IDENTIFIER_REQUIRED,
    });
  });
  it("Should return error object with error code 118", function () {
    const result = errorObjects.USER_IDENTIFIER_DOES_NOT_MATCH_TOKEN;
    expect(result).to.be.eql({
      errorCode: 118,
      errorSubCode: "USER_IDENTIFIER_DOES_NOT_MATCH_TOKEN",
      errorMessage: stringConstants.USER_IDENTIFIER_DOES_NOT_MATCH_TOKEN,
    });
  });

  it("Should return error object with error code 119", function () {
    const result = errorObjects.APPLE_ID_DOES_NOT_MATCH_EMAIL;

    expect(result).to.be.eql({
      errorCode: 119,
      errorSubCode: "APPLE_ID_DOES_NOT_MATCH_EMAIL",
      errorMessage: stringConstants.APPLE_ID_DOES_NOT_MATCH_EMAIL,
    });
  });

  it("Should return error object with error code 120", function () {
    const result = errorObjects.NOT_AUTHORIZED_TO_PERFORM_THE_ACTION;

    expect(result).to.be.eql({
      errorCode: 120,
      errorSubCode: "NOT_AUTHORIZED_TO_PERFORM_THE_ACTION",
      errorMessage: stringConstants.NOT_AUTHORIZED_TO_PERFORM_THE_ACTION,
    });
  });
});
