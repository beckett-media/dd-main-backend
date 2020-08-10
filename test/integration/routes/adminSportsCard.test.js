const chai = require("chai");
const expect = chai.expect;
const bcrypt = require("bcrypt");
const config = require("config");
const request = require("supertest");
const { stringConstants } = require("../../../utils/constants");
const { User } = require("../../../models/user");

let server, user, token, nonAdminUser, nonAdminToken;

describe("INTEG: adminSportsCard.test.js: Endpoint: /admin-sports-card/pending-grading-cards/10/1", async function () {
  this.beforeEach(async function () {
    server = require("../../../index");

    const body = {
      fullName: "Test User",
      password: "test_password",
      email: "test@test.com",
      role: stringConstants.role.ADMIN,
    };

    const salt = bcrypt.genSaltSync(10);
    body.password = bcrypt.hashSync(body.password, salt);

    user = new User(body);
    user = await user.save();
    token = user.generateAuthToken().token;

    body.email = "otheruser@test.com";
    body.role = stringConstants.role.USER;

    nonAdminUser = new User(body);
    nonAdminUser = await nonAdminUser.save();
    nonAdminToken = nonAdminUser.generateAuthToken().token;
  });

  this.afterEach(async function () {
    await server.close();
    await user.remove();
    await nonAdminUser.remove();
  });

  async function getSubmittedCards() {
    return await request(server)
      .get("/admin-sports-card/pending-grading-cards/10/1")
      .set("Accept", "application/json")
      .set("x-app-token", config.get("appToken"))
      .set("x-auth-token", token);
  }

  it("Test 1: Should return the submitted cards in array of cards", async function () {
    const res = await getSubmittedCards();
    expect(res.status).to.be.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data).to.have.property("cards");
    expect(res.body.data).to.have.property("numCards");
  });

  it("Test 2: Should return 403 is user not admin", async function () {
    token = nonAdminToken;
    const res = await getSubmittedCards();
    expect(res.status).to.be.equal(403);
    expect(res.body.success).to.be.false;
  });
});
