const { User } = require("../../../../models/user");
const {
  valRegisterRequest,
  valUsernameRequest,
  valSignInRequest,
  valChangePasswordRequest,
} = require("../../../../middlewares/validation");
const chai = require("chai");
const expect = chai.expect;
const httpMocks = require("node-mocks-http");
const sinon = require("sinon");
const { stringConstants } = require("../../../../utils/constants");

let body;

describe("Unit: userValMid.test.js: Tests for user registeration requests", function () {
  this.beforeAll(function () {
    body = {
      fullName: "test user",
      email: "test@test.com",
      password: "test_password",
      osType: stringConstants.osType.ANDROID,
      deviceToken: "test",
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

  it("Should pass and call next if everything is valid", function () {
    const req = getRequest();
    const res = getResponse();
    const nextSpy = sinon.spy();

    valRegisterRequest(req, res, nextSpy);

    expect(nextSpy.calledOnce).to.be.true;
    expect(res.statusCode).to.be.equal(200);
  });

  describe("All test for full name in register request", function () {
    it("Should return 400 for no full name present", function () {
      delete body.fullName;

      const req = getRequest();
      const res = getResponse();
      const nextSpy = sinon.spy();

      valRegisterRequest(req, res, nextSpy);

      expect(nextSpy.called).to.be.false;
      expect(res.statusCode).to.be.equal(400);
    });
    it("Should return 400 for full name less than 2", function () {
      body.fullName = "l";

      const req = getRequest();
      const res = getResponse();
      const nextSpy = sinon.spy();

      valRegisterRequest(req, res, nextSpy);

      expect(nextSpy.called).to.be.false;
      expect(res.statusCode).to.be.equal(400);
    });
    it("Should return 400 for full name more than 255", function () {
      body.fullName = new Array(300).join("a");

      const req = getRequest();
      const res = getResponse();
      const nextSpy = sinon.spy();

      valRegisterRequest(req, res, nextSpy);

      expect(nextSpy.called).to.be.false;
      expect(res.statusCode).to.be.equal(400);
    });
    it("Should return 400 if full name not a string", function () {
      body.fullName = 12345;

      const req = getRequest();
      const res = getResponse();
      const nextSpy = sinon.spy();

      valRegisterRequest(req, res, nextSpy);

      expect(nextSpy.called).to.be.false;
      expect(res.statusCode).to.be.equal(400);
    });
  });

  describe("All tests related to email", function () {
    it("Should return 400 if no email in request body", function () {
      delete body.email;

      const req = getRequest();
      const res = getResponse();
      const nextSpy = sinon.spy();

      valRegisterRequest(req, res, nextSpy);

      expect(nextSpy.called).to.be.false;
      expect(res.statusCode).to.be.equal(400);
    });
    it("Should return 400 if not a valid email", function () {
      body.email = "test";

      const req = getRequest();
      const res = getResponse();
      const nextSpy = sinon.spy();

      valRegisterRequest(req, res, nextSpy);

      expect(nextSpy.called).to.be.false;
      expect(res.statusCode).to.be.equal(400);
    });
    it("Should return 400 if email less than 5", function () {
      body.email = "t@t.c";

      const req = getRequest();
      const res = getResponse();
      const nextSpy = sinon.spy();

      valRegisterRequest(req, res, nextSpy);

      expect(nextSpy.called).to.be.false;
      expect(res.statusCode).to.be.equal(400);
    });
    it("Should return 400 if email more than 255", function () {
      body.email = new Array(300).join("a") + "@test.com";

      const req = getRequest();
      const res = getResponse();
      const nextSpy = sinon.spy();

      valRegisterRequest(req, res, nextSpy);

      expect(nextSpy.called).to.be.false;
      expect(res.statusCode).to.be.equal(400);
    });
  });

  describe("All test related to password", function () {
    it("Should return 400 for no password field in request body", function () {
      delete body.password;

      const req = getRequest();
      const res = getResponse();
      const nextSpy = sinon.spy();

      valRegisterRequest(req, res, nextSpy);

      expect(nextSpy.called).to.be.false;
      expect(res.statusCode).to.be.equal(400);
    });
    it("Should return 400 for password length less than 6", function () {
      body.password = "test";

      body.email = "test";

      const req = getRequest();
      const res = getResponse();
      const nextSpy = sinon.spy();

      valRegisterRequest(req, res, nextSpy);

      expect(nextSpy.called).to.be.false;
      expect(res.statusCode).to.be.equal(400);
    });
  });
});

describe("Unit: userValMid.test.js: Test block for validating username request", function () {
  this.beforeEach(function () {
    body = {
      username: "test_user",
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

  it("Should call next if everything is valid", function () {
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    valUsernameRequest(req, res, next);
    expect(next.calledOnce).to.be.true;
    expect(res.statusCode).to.be.equal(200);
  });

  describe("Username specific validation test", function () {
    it("Should return 400 for no username filed in request body", function () {
      delete body.username;
      const req = getRequest();
      const res = getResponse();
      const next = sinon.spy();

      valUsernameRequest(req, res, next);
      expect(res.statusCode).to.be.equal(400);
      expect(next.called).to.be.false;
    });
    it("Should return 400 for username less than 5", function () {
      body.username = "test";
      const req = getRequest();
      const res = getResponse();
      const next = sinon.spy();

      valUsernameRequest(req, res, next);
      expect(res.statusCode).to.be.equal(400);
      expect(next.called).to.be.false;
    });
  });
});

describe("Unit: userValMid.test.js: Test block to test sign in request", function () {
  this.beforeEach(function () {
    body = {
      email: "test@test.com",
      password: "test_password",
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

  it("Should call next if everything is valid", function () {
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    valSignInRequest(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(res.statusCode).to.equal(200);
  });

  describe("Test focussed on email validation in sign in request", function () {
    it("Should return 400 for email not present", function () {
      delete body.email;

      const req = getRequest();
      const res = getResponse();
      const next = sinon.spy();

      valSignInRequest(req, res, next);

      expect(next.called).to.be.false;
      expect(res.statusCode).to.equal(400);
    });
    it("Should return 400 for email less than 5", function () {
      body.email = "t@t.c";
      const req = getRequest();
      const res = getResponse();
      const next = sinon.spy();

      valSignInRequest(req, res, next);

      expect(next.called).to.be.false;
      expect(res.statusCode).to.equal(400);
    });
    it("Should return 400 for invalid email", function () {
      body.email = "something";

      const req = getRequest();
      const res = getResponse();
      const next = sinon.spy();

      valSignInRequest(req, res, next);

      expect(next.called).to.be.false;
      expect(res.statusCode).to.equal(400);
    });
  });

  describe("Test focussed on password validation in sign in request", function () {
    it("Should return 400 for password not present", function () {
      delete body.password;

      const req = getRequest();
      const res = getResponse();
      const next = sinon.spy();

      valSignInRequest(req, res, next);

      expect(next.called).to.be.false;
      expect(res.statusCode).to.equal(400);
    });
    it("Should return 400 for password less than 6", function () {
      body.password = "test";

      const req = getRequest();
      const res = getResponse();
      const next = sinon.spy();

      valSignInRequest(req, res, next);

      expect(next.called).to.be.false;
      expect(res.statusCode).to.equal(400);
    });
  });
});
/**
 * Unit test for passward change request validator
 */
describe("Unit: userValMid.test.js: Request validator test block for password change request", function (req, res) {
  this.beforeEach(function () {
    body = {
      oldPassword: "old_password",
      newPassword: "new_password",
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

  it("Should pass all validation if request parameters valid", function () {
    const req = getRequest();
    const res = getResponse();
    const next = sinon.spy();

    valChangePasswordRequest(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(res.statusCode).to.be.equal(200);
  });

  describe("All tests related to old password field", function () {
    it("Should return 400 if no old password field in request", function () {
      delete body.oldPassword;
      const req = getRequest();
      const res = getResponse();
      const next = sinon.spy();

      valChangePasswordRequest(req, res, next);

      expect(next.called).to.be.false;
      expect(res.statusCode).to.be.equal(400);
    });
    it("Should return 400 if old password less than 6", function () {
      body.oldPassword = "test";
      const req = getRequest();
      const res = getResponse();
      const next = sinon.spy();

      valChangePasswordRequest(req, res, next);

      expect(next.called).to.be.false;
      expect(res.statusCode).to.be.equal(400);
    });
    it("Should return 400 if old password more than 255", function () {
      body.oldPassword = new Array(300).join();

      const req = getRequest();
      const res = getResponse();
      const next = sinon.spy();

      valChangePasswordRequest(req, res, next);

      expect(next.called).to.be.false;
      expect(res.statusCode).to.be.equal(400);
    });
  });
  describe("All tests related to new password field", function () {
    it("Should return 400 if no new password field", function () {
      delete body.newPassword;

      const req = getRequest();
      const res = getResponse();
      const next = sinon.spy();

      valChangePasswordRequest(req, res, next);

      expect(next.called).to.be.false;
      expect(res.statusCode).to.be.equal(400);
    });
    it("Should return 400 if new password less than 6", function () {
      body.newPassword = "test";

      const req = getRequest();
      const res = getResponse();
      const next = sinon.spy();

      valChangePasswordRequest(req, res, next);

      expect(next.called).to.be.false;
      expect(res.statusCode).to.be.equal(400);
    });
    it("Should return 400 if old password more than 255", function () {
      body.newPassword = new Array(300).join();
      const req = getRequest();
      const res = getResponse();
      const next = sinon.spy();

      valChangePasswordRequest(req, res, next);

      expect(next.called).to.be.false;
      expect(res.statusCode).to.be.equal(400);
    });
  });
});
