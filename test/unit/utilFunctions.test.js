const {
  getRandomIntInclusive,
  createResObject,
  getKey,
} = require("../../utils/utilFunctions");
const { stringConstants } = require("../../utils/constants");
const chai = require("chai");
const expect = chai.expect;

describe("Random Number Inclusive:", () => {
  it("Should return random number between(Inclusive) min and max", () => {
    const result = getRandomIntInclusive(1, 1);
    expect(result).to.be.equal(1);
  });
});

describe("Create res object:", () => {
  it("Should return response object with error object", () => {
    const resObject = createResObject(true, {}, "Test message", {
      error: "Test",
    });
    expect(resObject).to.be.eql({
      success: true,
      data: {},
      message: "Test message",
      error: { error: "Test" },
    });
  });

  it("Should return response object without error object", () => {
    const resObject = createResObject(true, {}, "Test message");
    expect(resObject).to.be.eql({
      success: true,
      data: {},
      message: "Test message",
    });
  });
  it("Should return object where success is false", () => {
    const resObject = createResObject(true, {}, "Test message");
    expect(resObject).to.be.eql({
      success: true,
      data: {},
      message: "Test message",
    });
  });
});

describe("Get key from value in object", () => {
  it("Should return key", () => {
    const result = getKey(stringConstants, stringConstants.AUTH_TOKEN_STRING);
    expect(result).to.be.eql("AUTH_TOKEN_STRING");
  });

  it("Should return undefined", () => {
    const result = getKey(stringConstants, "test");
    expect(result).to.be.undefined;
  });
});
