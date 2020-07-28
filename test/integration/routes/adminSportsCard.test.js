const chai = require("chai");
const expect = chai.expect;
const bcrypt = require("bcrypt");
const config = require("config");
const request = require("supertest");
const { stringConstants } = require("../../../utils/constants");
const { User } = require("../../../models/user");

let server, user, token;

describe("INTEG: adminSportsCard.test.js: Endpoint: /admin-sports-card/pending-grading-cards/10/1", async function () {
  const body = {
    fullName: "Test User",
    password: "test_password",
    email: "test@test.com",
    role: stringConstants.role.ADMIN,
  };

  this.beforeEach(async function () {
    server = require("../../../index");

    const salt = bcrypt.genSaltSync(10);
    body.password = bcrypt.hashSync(body.password, salt);

    user = await User(body).save();
    token = user.generateAuthToken().token;
  });

  this.afterEach(async function () {
    await server.close();
    await user.remove();
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
  });
});
