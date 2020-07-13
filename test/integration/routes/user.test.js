const { User } = require("../../../models/user");
const { stringConstants } = require("../../../utils/constants");
const request = require("supertest");
const chai = require("chai");
const expect = chai.expect;
const config = require("config");
const path = require("path");
const rimraf = require("rimraf");
let server;

describe(" user.test.js INTEG: POST /user", function () {
  // Start the server before test
  this.beforeEach(function () {
    server = require("../../../index");
  });
  // Close the server after test
  this.afterEach(async function () {
    await server.close();
    const users = await User.find({});

    // Remove all users
    for (const user of users) {
      await user.remove();
    }
  });
  /**
   * Test block to test if getting error code of 400
   * when request body is invalid. Testing three
   * scenarios. They are are sending requests
   * with fullName, without email, and without password
   */
  describe("INTEG: /user/register-user", function () {
    this.afterEach(async function () {
      const users = await User.find({});
      for (const user of users) {
        await user.remove();
      }
    });
    it("Should create the user and return _id, fullName, email and auth token plus refresh token in header", async () => {
      let res = await request(server)
        .post("/user/register-user")
        .send({
          fullName: "Test User",
          email: "test@test.com",
          password: "test_password",
          osType: stringConstants.osType.ANDROID,
          deviceToken: "Test",
        })
        .set("Accept", "application/json")
        .set("x-app-token", config.get("appToken"));

      expect(res.status).to.be.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.user).to.have.all.keys(
        "id",
        "fullName",
        "email",
        "authTokenExpiry",
        "refreshTokenExpiry"
      );
      expect(res.headers).to.have.property("x-auth-token");
      expect(res.headers).to.have.property("x-refresh-token");
    });
    /**
     * Test block to get registeration of user and if
     * getting error when trying to register with
     * same email again
     */

    it("Should return error for duplicate email", async function () {
      let res = await request(server)
        .post("/user/register-user")
        .send({
          fullName: "Test User",
          email: "test@test.com",
          password: "test_password",
          osType: stringConstants.osType.ANDROID,
          deviceToken: "Test",
        })
        .set("Accept", "application/json")
        .set("x-app-token", config.get("appToken"));

      res = await request(server)
        .post("/user/register-user")
        .send({
          fullName: "Test User",
          email: "test@test.com",
          password: "test_password",
          osType: stringConstants.osType.ANDROID,
          deviceToken: "Test",
        })
        .set("Accept", "application/json")
        .set("x-app-token", config.get("appToken"));
      expect(res.status).to.be.equal(400);
      expect(res.body.success).to.be.false;
    });
  });

  /**
   * Test block for testing add-update username
   * Tests to check add update username
   */
  describe("INTEG: POST request to add-update username for a user", function () {
    this.afterEach(async function () {
      const users = await User.find({});
      for (const user of users) {
        await user.remove();
      }
    });
    /**
     * Auth token not provided in the request header
     */
    it("Should return status code 401 if no auth token provided", async function () {
      let res = await request(server)
        .post("/user/add-update-username")
        .send({ username: "test.test" })
        .set("Accept", "application/json")
        .set("x-app-token", config.get("appToken"));
      expect(res.status).to.be.equal(401);
      expect(res.body.success).to.be.false;
    });

    /**
     * Should successfully be able to update the username
     */
    it("Should update the username and return _id, fullName, email, profile (if any) and username", async function () {
      // First create the user and get the auth token
      let res = await request(server)
        .post("/user/register-user")
        .send({
          fullName: "Test User",
          email: "test@test.com",
          password: "test_password",
          osType: stringConstants.osType.ANDROID,
          deviceToken: "Test",
        })
        .set("Accept", "application/json")
        .set("x-app-token", config.get("appToken"));
      let authToken = res.headers["x-auth-token"];
      // Use that auth token to update the username password
      let username = "test.test";
      res = await request(server)
        .post("/user/add-update-username")
        .send({ username: username })
        .set({ Accept: "application/json", "x-auth-token": authToken })
        .set("x-app-token", config.get("appToken"));
      expect(res.status).to.be.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.user).to.have.property("fullName");
      expect(res.body.data.user).to.have.property("email");
      expect(res.body.data.user).to.have.property("id");
      expect(res.body.data.user).to.have.property("username");
    });

    /**
     * Should return 400 for username already taken
     */
    it("Should return 400 for username already taken", async function () {
      // First create the user and get the auth token
      let res = await request(server)
        .post("/user/register-user")
        .send({
          fullName: "Test User",
          email: "test1@test.com",
          password: "test_password",
          osType: stringConstants.osType.ANDROID,
          deviceToken: "Test",
        })
        .set("Accept", "application/json")
        .set("x-app-token", config.get("appToken"));

      let authToken = res.headers["x-auth-token"];
      let username = "test.test";
      res = await request(server)
        .post("/user/add-update-username")
        .send({ username: username })
        .set({ Accept: "application/json", "x-auth-token": authToken })
        .set("x-app-token", config.get("appToken"));
      expect(res.status).to.be.equal(200);
      expect(res.body.success).to.be.true;

      res = await request(server)
        .post("/user/register-user")
        .send({
          fullName: "Test Two User",
          email: "test2@test.com",
          password: "test_password",
          osType: stringConstants.osType.ANDROID,
          deviceToken: "Test",
        })
        .set("Accept", "application/json")
        .set("x-app-token", config.get("appToken"));

      authToken = res.headers["x-auth-token"];
      res = await request(server)
        .post("/user/add-update-username")
        .send({ username: username })
        .set({ Accept: "application/json", "x-auth-token": authToken })
        .set("x-app-token", config.get("appToken"));
      expect(res.status).to.be.equal(400);
      expect(res.body.success).to.be.false;
    });
  });

  describe("INTEG: /user/change-password", function () {
    let authToken;

    this.beforeEach(async function () {
      // First create the user and get the auth token
      const res = await request(server)
        .post("/user/register-user")
        .send({
          fullName: "Test User",
          email: "test@test.com",
          password: "test_password",
          osType: stringConstants.osType.ANDROID,
          deviceToken: "Test",
        })
        .set("Accept", "application/json")
        .set("x-app-token", config.get("appToken"));
      authToken = res.headers["x-auth-token"];
    });

    this.afterEach(async function () {
      const users = await User.find({});
      for (const user of users) {
        await user.remove();
      }
    });

    it("Should update the password successfully", async function () {
      const res = await request(server)
        .post("/user/change-password")
        .send({
          newPassword: "Test123!",
          oldPassword: "test_password",
        })
        .set("Accept", "application/json")
        .set("x-auth-token", authToken)
        .set("x-app-token", config.get("appToken"));

      expect(res.status).to.be.equal(200);
      expect(res.body.success).to.be.true;
    });
    it("Should return 400 for incorrect password", async function () {
      const res = await request(server)
        .post("/user/change-password")
        .send({
          newPassword: "Test123!",
          oldPassword: "Test123!",
        })
        .set("Accept", "application/json")
        .set("x-auth-token", authToken)
        .set("x-app-token", config.get("appToken"));

      expect(res.status).to.be.equal(400);
      expect(res.body.success).to.be.false;
    });
  });

  describe("INTEG: /user/notification-settings", function () {
    this.afterEach(async function () {
      const users = await User.find({});
      for (const user of users) {
        await user.remove();
      }
    });
    let token;
    this.beforeEach(async function () {
      body = {
        email: "test@test.com",
        password: "test123!",
        fullName: "test_user",
        osType: stringConstants.osType.ANDROID,
        deviceToken: "Test",
      };
      let user = new User(body);
      token = user.generateAuthToken().token;
      user = await user.save();
    });

    it("Should return notification setting", async function () {
      const res = await request(server)
        .get("/user/notification-settings")
        .set("Accept", "application/json")
        .set("x-auth-token", token)
        .set("x-app-token", config.get("appToken"));

      expect(res.status).to.be.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.eql({ notifications: true });
    });

    it("Should toggle notification setting", async function () {
      const res = await request(server)
        .post("/user/toggle-notification-settings")
        .set("Accept", "application/json")
        .set("x-auth-token", token)
        .set("x-app-token", config.get("appToken"));

      expect(res.status).to.be.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.eql({ notifications: false });
    });
  });

  describe("INTEG: GET /user-details Test to get all user details", function () {
    let token, user;
    this.beforeEach(async function () {
      body = {
        email: "test@test.com",
        password: "test123!",
        fullName: "test_user",
        username: "test.test",
        profilePicture: "test",
      };
      user = new User(body);
      token = user.generateAuthToken().token;
      user = await user.save();
    });

    this.afterEach(async function () {
      const users = await User.find({});
      for (const user of users) {
        await user.remove();
      }
    });

    it("Should get all user related details", async function () {
      const res = await request(server)
        .get("/user/user-details")
        .set("Accept", "application/json")
        .set("x-auth-token", token)
        .set("x-app-token", config.get("appToken"));

      expect(res.status).to.be.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.user).to.be.eql({
        id: user._id.toString(),
        fullName: "test_user",
        email: "test@test.com",
        profilePicture: "test",
        username: "test.test",
        role: "user",
        settings: {
          notifications: true,
        },
      });
    });
  });
});
