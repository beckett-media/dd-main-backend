const { User } = require("../../../models/user");
const { stringConstants } = require("../../../utils/constants");
const bcrypt = require("bcrypt");
const config = require("config");
const request = require("supertest");
const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");

let server, user;

describe("INTEG: authenticateAdmin.test.js: EndPoint: /admin-auth/sign-in", function () {
  let email = "test@test.com",
    password = "test_password",
    reqBody;
  this.beforeEach(async function () {
    server = require("../../../index");

    const salt = bcrypt.genSaltSync(10);
    const encryptedPassword = bcrypt.hashSync(password, salt);

    user = new User({
      fullName: "Test Admin",
      password: encryptedPassword,
      email: "test@test.com",
      role: stringConstants.role.ADMIN,
    });
    user = await user.save();

    reqBody = { email, password };
  });

  this.afterEach(async function () {
    await server.close();
    await user.remove();
  });

  const signinAdmin = async function () {
    return await request(server)
      .post("/admin-auth/sign-in")
      .send(reqBody)
      .set("Accept", "application/json")
      .set("x-app-token", config.get("appToken"));
  };

  it("Should sign in admin successfully", async function () {
    const res = await signinAdmin();

    expect(res.status).to.be.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body).to.have.property("data");
    expect(res.body.data).to.have.property("user");
    const user = res.body.data.user;
    expect(user).to.have.all.keys(
      "id",
      "authTokenExpiry",
      "email",
      "refreshTokenExpiry",
      "firstSignin",
      "fullName",
      "profilePicture",
      "signupType",
      "username"
    );
  });

  it("Should return 403 if user not an admin", async function () {
    await User.findByIdAndUpdate(user._id, {
      $set: { role: stringConstants.role.USER },
    });

    const res = await signinAdmin();

    expect(res.status).to.be.equal(403);
  });

  it("Should return 400 if sign up type not in_app", async function () {
    user.metadata.signupType = stringConstants.signupType.APPLE;

    user = await user.save();

    const res = await signinAdmin();

    expect(res.status).to.be.equal(400);
  });

  it("Should return 400 if no password for user in database", async function () {
    delete user.password;
    user.metadata.signupType = stringConstants.signupType.APPLE;

    user = await user.save();

    const res = await signinAdmin();

    expect(res.status).to.be.equal(400);
  });

  it("Should return 400 if password not valid", async function () {
    reqBody.password = "something";

    const res = await signinAdmin();

    expect(res.status).to.be.equal(400);
  });
  it("Should return 404 for email not found", async function () {
    reqBody.email = "something@test.com";

    const res = await signinAdmin();

    expect(res.status).to.be.equal(404);
  });
});
