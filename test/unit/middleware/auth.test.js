const { User } = require("../../../models/user");
const { stringConstants } = require("../../../utils/constants");
const auth = require("../../../middlewares/authenticateUser");
const httpMocks = require("node-mocks-http");
const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");

let body, token;
describe("Unit: auth.test.js: Auth middleware", function () {
  let user;
  /**
   * Testing the authentication middleware
   */

  this.beforeEach(async function () {
    body = {
      email: "test@test.com",
      password: "test123!",
      fullName: "test_user",
    };
    user = new User(body);
    user = await user.save();
    token = user.generateAuthToken().token;
  });

  this.afterEach(async function () {
    user = await user.remove();
  });

  function getRequest() {
    return httpMocks.createRequest({
      headers: {
        "x-auth-token": token,
      },
    });
  }

  function getResponse() {
    return httpMocks.createResponse();
  }

  it("Should populate req.user with the payload of a valid JWT and call next middleware", async function () {
    const req = getRequest();
    const res = getResponse();
    const nextSpy = sinon.spy();

    await auth(req, res, nextSpy);

    expect(nextSpy.calledOnce).to.be.true;
    expect(req.user.role).to.be.include("user", "_id");
    expect(res.statusCode).to.be.equal(200);
  });

  it("Should return 401 for invalid JWT token", async function () {
    token = "test_invalid_token";
    const req = getRequest();
    const res = getResponse();
    const nextSpy = sinon.spy();

    await auth(req, res, nextSpy);

    expect(nextSpy.called).to.be.false;
    expect(res.statusCode).to.be.equal(401);
  });

  it("Should return 401 for no token provided", async function () {
    const req = getRequest();
    const res = getResponse();
    const nextSpy = sinon.spy();

    delete req.headers["x-auth-token"];

    await auth(req, res, nextSpy);
    expect(res.statusCode).to.be.equal(401);
  });
});
