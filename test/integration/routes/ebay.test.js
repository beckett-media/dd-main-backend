const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const config = require("config");
const { User } = require("../../../models/user");

let server;

describe("INTEG: ebay.test.js: Test ebay get oAuth route", function () {
  // Start the server before test
  this.beforeEach(function () {
    server = require("../../../index");
  });

  this.afterEach(async function () {
    await server.close();
    const users = await User.find({});

    // Remove all users
    for (const user of users) {
      await user.remove();
    }
  });

  it("Test 1: Should return 400 for no ebay code as query parameter", async function () {
    const res = await request(server)
      .get("/ebay/ebay-get-oauth")
      .set("Accept", "application/json")
      .set("x-app-token", config.get("appToken"));
    expect(res.status).to.be.equal(400);
    expect(res.body.success).to.be.false;
  });
  it("Test 2: Should return 400 for invalid ebay code", async function () {
    const res = await request(server)
      .get("/ebay/ebay-get-oauth?code=test")
      .set("Accept", "application/json")
      .set("x-app-token", config.get("appToken"));
    expect(res.status).to.be.equal(400);
    expect(res.body.success).to.be.false;
  });
});
