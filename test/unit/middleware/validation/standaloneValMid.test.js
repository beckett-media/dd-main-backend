/**
 * Test to validate validation middelwares that are standalone
 * such as validate object ID and others
 */
const { User } = require("../../../../models/user");
const {
  valObjectIdInUrl,
  valPageSizeNumber,
} = require("../../../../middlewares/validation");
const chai = require("chai");
const expect = chai.expect;
const httpMocks = require("node-mocks-http");
const sinon = require("sinon");

let id;
describe("Unit: standaloneValMid.test.js Object ID middleware tests", function () {
  this.beforeEach(function () {
    id = new User()._id.toString();
  });

  function getRequest() {
    return httpMocks.createRequest({
      params: {
        id: id,
      },
    });
  }

  function getResponse() {
    return httpMocks.createResponse();
  }

  it("Should call next if Object ID is valid", function () {
    const req = getRequest();
    const res = getResponse();
    const nextSpy = sinon.spy();

    valObjectIdInUrl(req, res, nextSpy);

    expect(nextSpy.calledOnce).to.be.true;
    expect(res.statusCode).to.be.equal(200);
  });

  it("Should return 400 if object ID is not a valid MongoDB object ID", function () {
    id = "test";
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    valObjectIdInUrl(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
});

describe("Unit: standaloneValMid.test.js Page size and page number validation middleware tests", function () {
  let params;

  this.beforeEach(function () {
    params = {
      pageSize: 1,
      pageNumber: 1,
    };
  });

  function getRequest() {
    return httpMocks.createRequest({
      params: params,
    });
  }

  function getResponse() {
    return httpMocks.createResponse();
  }

  it("Should called next middleware if everything is fine", function () {
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    valPageSizeNumber(req, res, next);
    expect(next.calledOnce).to.be.true;
    expect(res.statusCode).to.be.equal(200);
  });

  it("Should return 400 if no pageSize in params", function () {
    delete params.pageSize;

    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    valPageSizeNumber(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
  it("Should return 400 if pageSize less than 1", function () {
    params.pageSize = -1;
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    valPageSizeNumber(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
  it("Should return 400 if pageSize not a number", function () {
    params.pageSize = "String";
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    valPageSizeNumber(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
  it("Should return 400 if no pageNumber in params", function () {
    delete params.pageNumber;
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    valPageSizeNumber(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
  it("Should return 400 if pageNumber less than 1", function () {
    params.pageNumber = -1;
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    valPageSizeNumber(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
  it("Should return 400 if pageNumber not a number", function () {
    params.pageNumber = "String";
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    valPageSizeNumber(req, res, next);
    expect(next.calledOnce).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
});
