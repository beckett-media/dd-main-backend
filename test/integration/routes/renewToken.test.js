const { User } = require("../../../models/user");
const { stringConstants } = require("../../../utils/constants");
const request = require("supertest");
const chai = require("chai");
const expect = chai.expect;
const config = require("config");
const rimraf = require("rimraf");
const path = require("path");

let server;

/**
 * Test the authentication route
 */
describe("Integ: renewToken.test.js: EndPoint: /auth-token", function () {
  // Start the server before test
  this.beforeEach(function () {
    server = require("../../../index");
  });
  // Close the server after test
  this.afterEach(async function () {
    await server.close();
    const users = await User.find({});
    for (const user of users) {
      await user.remove();
    }
  });

  describe("INTEG: GET /auth-token/renew-auth-token", function () {
    this.afterEach(async function () {
      const users = await User.find({});
      for (const user of users) {
        await user.remove();
      }
    });
    /**
     * Should return 400 when no auth token found in request header
     */
    it("Should return 400 for no auth token found in request header", async function () {
      const res = await request(server)
        .get("/auth-token/renew-auth-token")
        .set("Accept", "application/json")
        .set("x-app-token", config.get("appToken"));
      expect(res.status).to.equal(400);
      expect(res.body.success).to.be.false;
    });
    /**
     * Should return 400 when no refresh token found in request header
     */
    it("Should return 400 for no auth token found in request header", async function () {
      const res = await request(server)
        .get("/auth-token/renew-auth-token")
        .set({ Accept: "application/json", "x-auth-token": "test" })
        .set("x-app-token", config.get("appToken"));

      expect(res.status).to.be.equal(400);
      expect(res.body.success).to.be.false;
    });

    /**
     * Should return new auth token when valid auth and refresh token in request
     * headers
     */
    it("Should return renewed auth token and refresh token", async function () {
      let res = await request(server)
        .post("/user/register-user")
        .send({
          fullName: "Test User",
          email: "test1@test.com",
          password: "test_password",
          osType: stringConstants.osType.MAC_OS,
          deviceToken: "Test",
        })
        .set("Accept", "application/json")
        .set("x-app-token", config.get("appToken"));

      res = await request(server)
        .post("/authenticate/sign-in-user")
        .send({
          email: "test1@test.com",
          password: "test_password",
          osType: stringConstants.osType.MAC_OS,
          deviceToken: "Test",
        })
        .set("Accept", "application/json")
        .set("x-app-token", config.get("appToken"));

      let authToken = res.headers["x-auth-token"];
      let refreshToken = res.headers["x-refresh-token"];

      res = await request(server)
        .get("/auth-token/renew-auth-token")
        .set({
          Accept: "application/json",
          "x-auth-token": authToken,
          "x-refresh-token": refreshToken,
        })
        .set("x-app-token", config.get("appToken"));
      expect(res.status).to.be.equal(200);
      expect(res.headers).to.have.property("x-auth-token");
      expect(res.headers).to.have.property("x-refresh-token");
    });

    /**
     * Should return 401 for invalid auth token
     */
    it("Should return renewed auth token and refresh token", async function () {
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

      res = await request(server)
        .post("/authenticate/sign-in-user")
        .send({
          email: "test1@test.com",
          password: "test_password",
          osType: stringConstants.osType.MAC_OS,
          deviceToken: "Test",
        })
        .set("Accept", "application/json")
        .set("x-app-token", config.get("appToken"));

      let authToken = res.headers["x-auth-token"];

      res = await request(server)
        .get("/auth-token/renew-auth-token")
        .set({
          Accept: "application/json",
          "x-auth-token": "invalid_token",
          "x-refresh-token": "invalid_token",
        })
        .set("x-app-token", config.get("appToken"));
      expect(res.status).to.be.equal(401);
    });
    /**
     * Should return 401 for invalid refresh token
     */
    it("Should return renewed auth token and refresh token", async function () {
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

      res = await request(server)
        .post("/authenticate/sign-in-user")
        .send({
          email: "test1@test.com",
          password: "test_password",
          osType: stringConstants.osType.MAC_OS,
          deviceToken: "Test",
        })
        .set("Accept", "application/json")
        .set("x-app-token", config.get("appToken"));

      let authToken = res.headers["x-auth-token"];

      res = await request(server)
        .get("/auth-token/renew-auth-token")
        .set({
          Accept: "application/json",
          "x-auth-token": authToken,
          "x-refresh-token": "invalid_token",
        })
        .set("x-app-token", config.get("appToken"));
      expect(res.status).to.be.equal(401);
    });
    /**
     * Should return 401 for user ID different in auth and refresh token
     */
    it("Should return 401 for different user ID in auth and refresh token", async function () {
      let res1 = await request(server)
        .post("/user/register-user")
        .send({
          fullName: "Test User",
          email: "test1@test.com",
          password: "test_password",
          osType: stringConstants.osType.MAC_OS,
          deviceToken: "Test",
        })
        .set("Accept", "application/json")
        .set("x-app-token", config.get("appToken"));

      const authToken1 = res1.headers["x-auth-token"];
      const refreshToken1 = res1.headers["x-refresh-token"];

      let res2 = await request(server)
        .post("/user/register-user")
        .send({
          fullName: "Test User",
          email: "test2@test.com",
          password: "test_password",
          osType: stringConstants.osType.MAC_OS,
          deviceToken: "Test",
        })
        .set("Accept", "application/json")
        .set("x-app-token", config.get("appToken"));

      const authToken2 = res2.headers["x-auth-token"];
      const refreshToken2 = res2.headers["x-refresh-token"];

      let res3 = await request(server)
        .get("/auth-token/renew-auth-token")
        .set({
          Accept: "application/json",
          "x-auth-token": authToken1,
          "x-refresh-token": refreshToken2,
        })
        .set("x-app-token", config.get("appToken"));
      expect(res3.status).to.be.equal(401);
      expect(res3.body.success).to.be.false;
    });
  });

  /**
   * Code block to check auth token validity
   */
  describe("INTEG: GET /auth-token/check-token", function () {
    this.afterEach(async function () {
      const users = await User.find({});
      for (const user of users) {
        await user.remove();
      }
    });
    /**
     * Return 400 for when token not set in request headers
     */
    it("Should throw 400 for auth token not found in request header", async function () {
      const res = await request(server)
        .get("/auth-token/check-auth-token")
        .send({})
        .set({ Accept: "application/json" })
        .set("x-app-token", config.get("appToken"));

      expect(res.status).to.be.equal(400);
      expect(res.body.success).to.be.false;
    });
    /**
     * Should return 401 for invalid auth token
     */
    it("Should throw 401 for auth token not valid", async function () {
      const res = await request(server)
        .get("/auth-token/check-auth-token")
        .send({})
        .set({ Accept: "application/json", "x-auth-token": "Test" })
        .set("x-app-token", config.get("appToken"));

      expect(res.status).to.be.equal(401);
      expect(res.body.success).to.be.false;
    });

    /**
     * Should return 200 for valid auth token
     */
    it("Should send 200 for valid auth token", async function () {
      const res1 = await request(server)
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

      const authToken = res1.headers["x-auth-token"];

      const res2 = await request(server)
        .get("/auth-token/check-auth-token")
        .send({})
        .set({ Accept: "application/json", "x-auth-token": authToken })
        .set("x-app-token", config.get("appToken"));

      expect(res2.status).to.be.equal(200);
      expect(res2.body.success).to.be.true;
    });
  });
});
