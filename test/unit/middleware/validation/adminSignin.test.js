const chai = require("chai");
const expect = chai.expect;
const httpMocks = require("node-mocks-http");
const sinon = require("sinon");
const { valAdminSignIn } = require("../../../../middlewares/validation");

describe("UNIT: adminSignin.test.js: Test for admin sign in validation middleware", function () {
  let reqBody = {
    email: "test@test.com",
    password: "test_password",
  };

  const getRequest = () => {
    return httpMocks.createRequest({
      body: reqBody,
    });
  };

  const getResponse = () => {
    return httpMocks.createResponse();
  };

  it("Should call next if body of request is valid", function () {
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    valAdminSignIn(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(res.statusCode).to.be.equal(200);
  });

  it("Should return 400 for no email in request", function () {
    delete reqBody.email;

    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    valAdminSignIn(req, res, next);

    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });

  it("Should return 400 if email not valid");
  it("Should return 400 if email less than 5 char");
  it("Should return 400 if email more than 255");
  it("Should return 400 for no password in request", function () {
    delete reqBody.password;

    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    valAdminSignIn(req, res, next);

    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(400);
  });
  it("Should return 400 for password less than 6 char");
  it("Should return 400 for password more than 255");
});
