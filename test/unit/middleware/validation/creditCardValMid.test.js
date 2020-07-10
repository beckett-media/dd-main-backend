/**
 * Test block to test update card requests
 */
const {
  valUpdateCreditCardRequest,
} = require("../../../../middlewares/validation");
const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const httpMocks = require("node-mocks-http");

let body;
describe("Update card request body validation tests", function () {
  this.beforeEach(function () {
    const year = new Date().getFullYear() + 1;
    body = {
      cardId: "testcardid",
      expMonth: 12,
      expYear: year,
      fullName: "test user",
    };
  });

  function getRequest() {
    return httpMocks.createRequest({
      body: body,
    });
  }

  function getResponse() {
    return httpMocks.createResponse();
  }
  /**
   * No expiration month in the request body
   */
  it("Should return 400 for no expMonth", function () {
    delete body.expMonth;
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    valUpdateCreditCardRequest(req, res, next);

    expect(res.statusCode).to.be.equal(400);
    expect(next.called).to.be.false;
  });
  /**
   * No expiration year in the request body should fail
   * request validation
   */
  it("Should return 400 for no expYear", function () {
    delete body.expYear;
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    valUpdateCreditCardRequest(req, res, next);

    expect(res.statusCode).to.be.equal(400);
    expect(next.called).to.be.false;
  });
  /**
   * Request validation should fail since no full name
   */
  it("Should return 400 for no full name", function () {
    delete body.fullName;
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    valUpdateCreditCardRequest(req, res, next);

    expect(res.statusCode).to.be.equal(400);
    expect(next.called).to.be.false;
  });
  /**
   * Should be rejected if no card ID
   */
  it("Should return 400 for no card id", function () {
    delete body.cardId;
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    valUpdateCreditCardRequest(req, res, next);

    expect(res.statusCode).to.be.equal(400);
    expect(next.called).to.be.false;
  });
  /**
   * Should be rejected for invalid card id
   */
  it("Should return 400 for invalid card id", function () {
    delete body.expMonth;
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    valUpdateCreditCardRequest(req, res, next);

    expect(res.statusCode).to.be.equal(400);
    expect(next.called).to.be.false;
  });
  /**
   * Request validation should fail for month less than 1
   */
  it("Should return 400 for expMonth less than 1", function () {
    body.expMonth = -1;
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    valUpdateCreditCardRequest(req, res, next);

    expect(res.statusCode).to.be.equal(400);
    expect(next.called).to.be.false;
  });
  /**
   * Request validation should fail since month more than 12
   */
  it("Should return 400 for expMonth more than 12", function () {
    body.expMonth = 13;
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    valUpdateCreditCardRequest(req, res, next);

    expect(res.statusCode).to.be.equal(400);
    expect(next.called).to.be.false;
  });
  /**
   * Expiration year cannot be less than current year
   */
  it("Should return 400 for expYear less than current year", function () {
    body.expYear = 2019;
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    valUpdateCreditCardRequest(req, res, next);

    expect(res.statusCode).to.be.equal(400);
    expect(next.called).to.be.false;
  });
});
