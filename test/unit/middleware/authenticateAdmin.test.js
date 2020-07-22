const { User } = require("../../../models/user");
const { stringConstants } = require("../../../utils/constants");
const authenticateAdmin = require("../../../middlewares/authenticateAdmin");
const chai = require("chai");
const expect = chai.expect;
const httpMocks = require("node-mocks-http");
const sinon = require("sinon");

let user, token;
describe("UNIT: authenticateAdmin.test.js: Tests for admin authentication middleware", function () {
  this.beforeEach(async function () {
    user = new User({
      fullName: "Test User",
      password: "Test_password",
      email: "test@test.com",
      role: stringConstants.role.ADMIN,
    });
    user = await user.save();
    token = user.generateAuthToken().token;
  });

  this.afterEach(async function () {
    await user.remove();
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

  it("Should call next if everything is fine", async function () {
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    await authenticateAdmin(req, res, next);

    expect(res.statusCode).to.be.equal(200);
    expect(next.calledOnce).to.be.true;
  });

  it("Should return 401 if no token found", async function () {
    token = undefined;

    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    await authenticateAdmin(req, res, next);

    expect(res.statusCode).to.be.equal(401);
    expect(next.called).to.be.false;
  });
  it("Should return 401 if not a valid token", async function () {
    token = "Some invalid token";

    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    await authenticateAdmin(req, res, next);

    expect(res.statusCode).to.be.equal(401);
    expect(next.called).to.be.false;
  });

  it("Should return 403 if role not admin", async function () {
    user = await User.findByIdAndUpdate(user._id, {
      $set: { role: stringConstants.role.USER },
    });
    token = user.generateAuthToken().token;

    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    await authenticateAdmin(req, res, next);

    expect(res.statusCode).to.be.equal(403);
    expect(next.called).to.be.false;
  });
});
