/**
 * Test to validate the opreation of app auth middleware
 * This middlware will be used at root of the express to
 * validate any incoming request
 */

const httpMocks = require("node-mocks-http");
const sinon = require("sinon");
const chai = require("chai");
const expect = chai.expect;
const config = require("config");
const appAuth = require("../../../middlewares/authenticateApp");
const { stringConstants } = require("../../../utils/constants");

let token;
describe("Unit: authenticateApp.test.js: Test block to test app token middleware", function () {
  this.beforeEach(function () {
    token = config.get("appToken");
  });

  function getRequest() {
    return httpMocks.createRequest({
      headers: {
        "x-app-token": token,
      },
    });
  }

  function getResponse() {
    return httpMocks.createResponse();
  }

  it("Should call the next middleware once the app token has been verified", function () {
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    appAuth(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(res.statusCode).to.be.equal(200);
  });

  it("Should return 401 for no token found in header", function () {
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    delete req.headers["x-app-token"];

    appAuth(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(401);
  });

  it("Should return 401 for token not valid", function () {
    token = "wrong_token";
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    appAuth(req, res, next);
    expect(next.called).to.be.false;
    expect(res.statusCode).to.be.equal(401);
  });
});
