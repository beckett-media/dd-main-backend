const { User } = require("../../../models/user");
const request = require("supertest");
const chai = require("chai");
const expect = chai.expect;
const config = require("config");
let server;

describe("INTEG: EndPoint /payment", function () {
  // Start the server before test
  beforeEach(function () {
    server = require("../../../index");
  });
  // Close the server after test
  afterEach(async function () {
    await server.close();
    await User.remove({});
  });

  /**
   * Test block to test /save-card-client-secret
   */
  describe("INTEG: EndPoint: GET /save-card-client-secret", function () {
    /**
     * Should get client secret from stripe
     */
    it("Should return client secret from stripe", async function () {
      // Register a user and login
      let res1 = await request(server)
        .post("/user/register-user")
        .send({
          fullName: "Test User",
          email: "test1@test.com",
          password: "test_password",
        })
        .set("Accept", "application/json")
        .set("x-app-token", config.get("appToken"));

      res1 = await request(server)
        .post("/authenticate/sign-in-user")
        .send({
          email: "test1@test.com",
          password: "test_password",
        })
        .set("Accept", "application/json")
        .set("x-app-token", config.get("appToken"));
      // Get the token and make the request
      const authToken = res1.headers["x-auth-token"];

      let res2 = await request(server)
        .get("/payment/save-card-client-secret")
        .set({ Accept: "application/json", "x-auth-token": authToken })
        .set("x-app-token", config.get("appToken"));

      expect(res2.status).to.be.equal(200);
      expect(res2.body.data).to.have.property("clientSecret");
    });
  });

  /**
   * Test block to test getting of saved cards
   */
  describe("INTEG: EndPoint: GET /saved-cards", function () {
    /**
     * Return a list of saved cards from stripe
     */
    it("Should return a list of saved cards", async function () {
      // Register a user and login
      let res1 = await request(server)
        .post("/user/register-user")
        .send({
          fullName: "Test User",
          email: "test1@test.com",
          password: "test_password",
        })
        .set("Accept", "application/json")
        .set("x-app-token", config.get("appToken"));

      res1 = await request(server)
        .post("/authenticate/sign-in-user")
        .send({
          email: "test1@test.com",
          password: "test_password",
        })
        .set("Accept", "application/json")
        .set("x-app-token", config.get("appToken"));
      // Get the token and make the request
      const authToken = res1.headers["x-auth-token"];

      let res2 = await request(server)
        .get("/payment/saved-cards")
        .set({ Accept: "application/json", "x-auth-token": authToken })
        .set("x-app-token", config.get("appToken"));

      expect(res2.status).to.be.equal(200);
      expect(res2.body.data).to.have.property("cards");
    });
  });
});
