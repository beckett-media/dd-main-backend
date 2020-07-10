/**
 * Error handler middleware tests
 */
const errorHandler = require("../../../middlewares/errorHandler");
const httpMocks = require("node-mocks-http");
const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");

describe("Error handler middleware testing", function () {
  it("Should return 500 error for internal err", function () {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    const next = sinon.spy();
    errorHandler(new Error("Test error"), req, res, next);
    expect(res.statusCode).to.be.equal(500);
  });
});
