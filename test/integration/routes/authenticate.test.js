const { User } = require("../../../models/user");
const { stringConstants } = require("../../../utils/constants");
const request = require("supertest");
const chai = require("chai");
const expect = chai.expect;
const config = require("config");
let server;

/**
 * Test the authentication route
 */
describe("INTEG: authenticate.test.js: EndPoint: /authenticate/sign-in-user", function () {
  // Start the server before test
  beforeEach(function () {
    server = require("../../../index");
  });
  // Close the server after test
  afterEach(async function () {
    await server.close();
    const users = await User.find({});
    for (const user of users) {
      await user.remove();
    }
  });

  /**
   * Test block to test all sing in related scenarios
   */
  describe("INTEG: Sign in user with email password", function () {
    /**
     * Code that is repeat in every test
     */
    let fullName, email, password, osType, deviceToken;

    const registerUser = async function () {
      return request(server)
        .post("/user/register-user")
        .send({
          fullName,
          email,
          password,
          osType,
          deviceToken,
        })
        .set("Accept", "application/json")
        .set(stringConstants.APP_TOKEN_STRING, config.get("appToken"));
    };

    const signInUser = async function () {
      return request(server)
        .post("/authenticate/sign-in-user")
        .send({
          email,
          password,
          osType,
          deviceToken,
        })
        .set("Accept", "application/json")
        .set(stringConstants.APP_TOKEN_STRING, config.get("appToken"));
    };

    beforeEach(function () {
      fullName = "Test User";
      email = "test1@test.com";
      password = "test_password";
      osType = stringConstants.osType.ANDROID;
      deviceToken = "test";
    });

    /**
     * Register the user and then sign in with the
     * credentials. It should successfully sign the
     * user in this the happy path
     */
    it("Should successfully sign in user successfully", async function () {
      await registerUser();
      let res = await signInUser();

      expect(res.status).to.be.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.headers).to.have.property(stringConstants.AUTH_TOKEN_STRING);
      expect(res.headers).to.have.property(
        stringConstants.REFRESH_TOKEN_STRING
      );
    });
    /**
     * Test with wrong password and should return 400
     */
    it("Should return 400 error for wrong password", async function () {
      await registerUser();

      password = "wrong_password";

      let res = await signInUser();

      expect(res.status).to.be.equal(400);
      expect(res.body.success).to.be.false;
    });
    /**
     * Do not register user and try to sign in.
     * It should return 404 for user not found.
     */
    it("Should return 404 error for user with email not found", async function () {
      await registerUser();

      email = "wrong_email@gmail.com";

      let res = await signInUser();

      expect(res.status).to.be.equal(404);
      expect(res.body.success).to.be.false;
    });

    it("Should add the device token to user device tokens", async function () {
      await registerUser();
      const res = await signInUser();

      const userId = res.body.data.user.id;

      const databaseUser = await User.findById(userId);
      expect(databaseUser.deviceTokens).to.be.eql(["test"]);
    });
  });
});

describe("INTEG: authenticate.test.js: Test the sign out route", function () {
  let server, user, token;
  this.beforeEach(async function () {
    server = require("../../../index");

    user = new User({
      fullName: "Test User",
      email: "test@test.com",
      deviceTokens: ["test"],
    });
    user = await user.save();

    token = user.generateAuthToken().token;
  });
  this.afterEach(async function () {
    await server.close();
    const users = await User.find({});
    for (const user of users) {
      await user.remove();
    }
  });

  it("Should remove the device token from the user", async function () {
    const res = await request(server)
      .post("/authenticate/sign-out")
      .send({
        deviceToken: "test",
      })
      .set("Accept", "application/json")
      .set(stringConstants.APP_TOKEN_STRING, config.get("appToken"))
      .set(stringConstants.AUTH_TOKEN_STRING, token);

    user = await User.findById(user._id);
    expect(res.status).to.be.equal(200);
    expect(user.deviceTokens).to.be.eql([]);
  });
});
