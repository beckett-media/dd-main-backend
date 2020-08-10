const chai = require("chai");
const expect = chai.expect;
const httpMocks = require("node-mocks-http");
const mongoose = require("mongoose");
const sinon = require("sinon");
const { Question } = require("../../../../models/question");
const { valCardGradeReq } = require("../../../../middlewares/validation");

describe("UNIT: adminSportsCardMid.test.js: related tests", async function () {
  let reqBody = {
    cardId: mongoose.Types.ObjectId().toHexString(),
    signedCeleb: 2000,
    cornerValue: 400,
    edgeValue: 100,
    surfaceValue: 400,
    eyeAppeal: 400,
    centerFront: 70,
    centerBack: 20,
    cardStains: 160,
    cardSleeving: -20,
    printingDefects: -600,
  };

  function getRequest() {
    return httpMocks.createRequest({ body: reqBody });
  }

  function getResponse() {
    return httpMocks.createResponse();
  }

  it("UNIT: Test 1: Should call next when everything is valid", async function () {
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    await valCardGradeReq(req, res, next);
    expect(next.calledOnce).to.be.true;
    expect(res.statusCode).to.be.equal(200);
  });

  it("UNIT: Test 2: Should return 400 for cardId not present", async function () {
    delete reqBody.cardId;
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    await valCardGradeReq(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });

  it("UNIT: Test 3: Should return 400 for cardId not a valid mongo ID", async function () {
    reqBody.cardId = "test";
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    await valCardGradeReq(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
  it("UNIT: Test 4: Should return 400 for signedCeleb not present", async function () {
    delete reqBody.signedCeleb;

    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    await valCardGradeReq(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
  it("UNIT: Test 5: Should return 400 for signedCeleb not a number", async function () {
    reqBody.signedCeleb = "Something";
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    await valCardGradeReq(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
  it("UNIT: Test 6: Should return 400 for cornerValue not present", async function () {
    delete reqBody.cornerValue;
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    await valCardGradeReq(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
  it("UNIT: Test 6: Should return 400 for cornerValue not a number", async function () {
    reqBody.cornerValue = "Test";
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    await valCardGradeReq(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
  it("UNIT: Test 7: Should return 400 for edgeValue not present", async function () {
    delete reqBody.edgeValue;
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    await valCardGradeReq(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
  it("UNIT: Test 8: Should return 400 for edgeValue not a number", async function () {
    reqBody.edgeValue = "test";
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    await valCardGradeReq(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
  it("UNIT: Test 9: Should return 400 for surfaceValue not present", async function () {
    delete reqBody.surfaceValue;
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    await valCardGradeReq(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
  it("UNIT: Test 10: Should return 400 for surfaceValue not a number", async function () {
    reqBody.surfaceValue = "test";
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    await valCardGradeReq(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
  it("UNIT: Test 11: Should return 400 for eyeAppeal not present", async function () {
    delete reqBody.eyeAppeal;
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    await valCardGradeReq(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
  it("UNIT: Test 12: Should return 400 for eyeAppeal not a number", async function () {
    reqBody.eyeAppeal = "Test";
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    await valCardGradeReq(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
  it("UNIT: Test 13: Should return 400 for centerFront not present", async function () {
    delete reqBody.centerFront;
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    await valCardGradeReq(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
  it("UNIT: Test 14: Should return 400 for centerFront not a number", async function () {
    reqBody.centerFront = "Test";

    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    await valCardGradeReq(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
  it("UNIT: Test 15: Should return 400 for centerBack not present", async function () {
    delete reqBody.centerBack;
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    await valCardGradeReq(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
  it("UNIT: Test 16: Should return 400 for centerBack not a number", async function () {
    reqBody.centerBack = "Test";
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    await valCardGradeReq(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
  it("UNIT: Test 17: Should return 400 for cardStains not present", async function () {
    delete reqBody.cardStains;
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    await valCardGradeReq(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
  it("UNIT: Test 18: Should return 400 for cardStains not a number", async function () {
    reqBody.cardStains = "Test";
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    await valCardGradeReq(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
  it("UNIT: Test 19: Should return 400 for cardSleeving not present", async function () {
    delete reqBody.cardSleeving;
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    await valCardGradeReq(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
  it("UNIT: Test 20: Should return 400 for cardSleeving not a number", async function () {
    reqBody.cardSleeving = "Test";
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    await valCardGradeReq(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
  it("UNIT: Test 21: Should return 400 for printingDefects not present", async function () {
    delete reqBody.printingDefects;
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    await valCardGradeReq(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
  it("UNIT: Test 22: Should return 400 for printingDefects not a number", async function () {
    reqBody.printingDefects = "Test";
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    await valCardGradeReq(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
});
