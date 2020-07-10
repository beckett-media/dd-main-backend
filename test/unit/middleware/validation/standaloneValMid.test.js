/**
 * Test to validate validation middelwares that are standalone
 * such as validate object ID and others
 */
const { User } = require("../../../../models/user");
const { valObjectIdInUrl } = require("../../../../middlewares/validation");
const chai = require("chai");
const expect = chai.expect;
const httpMocks = require("node-mocks-http");
const sinon = require("sinon");

let id;
describe("Object ID middleware tests", function () {
  this.beforeEach(function () {
    id = new User()._id.toString();
  });

  function getRequest() {
    return httpMocks.createRequest({
      params: {
        id: id,
      },
    });
  }

  function getResponse() {
    return httpMocks.createResponse();
  }

  it("Should call next if Object ID is valid", function () {
    const req = getRequest();
    const res = getResponse();
    const nextSpy = sinon.spy();

    valObjectIdInUrl(req, res, nextSpy);

    expect(nextSpy.calledOnce).to.be.true;
    expect(res.statusCode).to.be.equal(200);
  });
});
