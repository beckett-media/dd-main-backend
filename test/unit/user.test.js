const { User } = require("../../models/user");
const jwt = require("jsonwebtoken");
const config = require("config");
const mongoose = require("mongoose");
const { stringConstants } = require("../../utils/constants");
const chai = require("chai");
const expect = chai.expect;

describe("User auth token testing", () => {
  it("Should return a valid JWT", () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      fullName: "Test User",
      email: "test@test.com",
      password: "test_password",
    };
    const user = new User(payload);
    const token = user.generateAuthToken();

    const decoded = jwt.verify(
      token.token,
      config.get(stringConstants.JWT_PRIATE_KEY)
    );
    expect(decoded).to.include({
      _id: payload._id,
      role: stringConstants.role.USER,
    });
  });

  it("Should have token and expiry properties", () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      fullName: "Test User",
      email: "test@test.com",
      password: "test_password",
    };
    const user = new User(payload);
    const token = user.generateAuthToken();
    expect(token).to.have.property("token");
    expect(token).to.have.property("expiry");
  });
});

describe("User refresh token testing", () => {
  it("Should return a valid refresh token", () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      fullName: "Test User",
      email: "test@test.com",
      password: "test_password",
    };
    const user = new User(payload);
    const refreshToken = user.generateRefreshToken();

    const decoded = jwt.verify(
      refreshToken.token,
      config.get(stringConstants.JWT_REFRESH_KEY)
    );
    expect(decoded).to.include({ _id: payload._id });
  });

  it("Should have token and expiry properties", () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      fullName: "Test User",
      email: "test@test.com",
      password: "test_password",
    };
    const user = new User(payload);
    const refreshToken = user.generateRefreshToken();

    expect(refreshToken).to.have.property("token");
    expect(refreshToken).to.have.property("expiry");
  });
});
