const chai = require("chai");
const expect = chai.expect;
const bcrypt = require("bcrypt");
const config = require("config");
const request = require("supertest");
const { stringConstants } = require("../../../utils/constants");
const { User } = require("../../../models/user");

let server, user, nonAdminUser, token, nonAdminToken;

describe("INTEG: adminQuestions.test.js: Endpoint: /admin-questions/grading-questions", async function () {
  this.beforeEach(async function () {
    const body = {
      fullName: "Test User",
      password: "test_password",
      email: "test@test.com",
      role: stringConstants.role.ADMIN,
    };

    server = require("../../../index");

    const salt = bcrypt.genSaltSync(10);
    body.password = bcrypt.hashSync(body.password, salt);

    user = new User(body);
    user = await user.save();
    token = user.generateAuthToken().token;

    body.role = stringConstants.role.USER;
    body.email = "nonadmin@test.com";
    nonAdminUser = new User(body);
    nonAdminUser = await nonAdminUser.save();
    nonAdminToken = nonAdminUser.generateAuthToken().token;
  });

  this.afterEach(async function () {
    await server.close();
    await user.remove();
    await nonAdminUser.remove();
  });

  async function getGradingQuestions() {
    return await request(server)
      .get("/admin-questions/grading-questions")
      .set("Accept", "application/json")
      .set("x-app-token", config.get("appToken"))
      .set("x-auth-token", token);
  }

  it("Test 1: Should return array of questions", async function () {
    const res = await getGradingQuestions();
    expect(res.status).to.be.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data).to.have.property("questions");
  });

  it("Test 2: Should send back 403 if user not admin", async function () {
    token = nonAdminToken;
    const res = await getGradingQuestions();
    expect(res.status).to.be.equal(403);
  });
});
