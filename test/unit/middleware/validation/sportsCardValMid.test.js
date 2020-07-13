const { valUpdateCardData } = require("../../../../middlewares/validation");
const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const httpMocks = require("node-mocks-http");

describe("Unit: sportsCardValMid.test.js: Sports card request related validations", function () {
  describe("Validation for add-update data", function () {
    let body;

    this.beforeEach(function () {
      body = {
        year: 2019,
        brand: "Some brand",
        cardNumber: 12343,
        playerNames: ["Love", "Kamlesh"],
      };
    });

    function getRequest() {
      return httpMocks.createRequest({
        body: body,
      });
    }

    function getResponse() {
      return httpMocks.createResponse();
    }

    it("Should call next if everything is as expected in request body", function () {
      const req = getRequest();
      const res = getResponse();
      const next = sinon.spy();

      valUpdateCardData(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(res.statusCode).to.be.equal(200);
    });

    describe("All year related tests", function () {
      it("Should return 400 for no year in rquest body", function () {
        delete body.year;

        const req = getRequest();
        const res = getResponse();
        const next = sinon.spy();

        valUpdateCardData(req, res, next);

        expect(next.called).to.be.false;
        expect(res.statusCode).to.be.equal(400);
      });

      it("Should return 400 is year is 3 digits", function () {
        body.year = 123;
        const req = getRequest();
        const res = getResponse();
        const next = sinon.spy();

        valUpdateCardData(req, res, next);

        expect(next.called).to.be.false;
        expect(res.statusCode).to.be.equal(400);
      });

      it("Should return 400 if year more than current year", function () {
        const currentYear = new Date().getFullYear();
        body.year = currentYear + 1;
        const req = getRequest();
        const res = getResponse();
        const next = sinon.spy();

        valUpdateCardData(req, res, next);

        expect(next.called).to.be.false;
        expect(res.statusCode).to.be.equal(400);
      });

      it("Should return 400 if year not a number", function () {
        body.year = "test";
        const req = getRequest();
        const res = getResponse();
        const next = sinon.spy();

        valUpdateCardData(req, res, next);

        expect(next.called).to.be.false;
        expect(res.statusCode).to.be.equal(400);
      });
    });

    describe("All brand related tests", function () {
      it("Should return 400 for no brand in request body", function () {
        delete body.brand;

        const req = getRequest();
        const res = getResponse();
        const next = sinon.spy();

        valUpdateCardData(req, res, next);

        expect(next.called).to.be.false;
        expect(res.statusCode).to.be.equal(400);
      });

      it("Should return 400 for empty string", function () {
        body.brand = "";
        const req = getRequest();
        const res = getResponse();
        const next = sinon.spy();

        valUpdateCardData(req, res, next);

        expect(next.called).to.be.false;
        expect(res.statusCode).to.be.equal(400);
      });

      it("Should return 400 if brand not a string", function () {
        body.brand = 1234;
        const req = getRequest();
        const res = getResponse();
        const next = sinon.spy();

        valUpdateCardData(req, res, next);

        expect(next.called).to.be.false;
        expect(res.statusCode).to.be.equal(400);
      });

      it("Should return 400 if brand string greater than 255 chars", function () {
        body.brand = new Array(300).join("");

        const req = getRequest();
        const res = getResponse();
        const next = sinon.spy();

        valUpdateCardData(req, res, next);

        expect(next.called).to.be.false;
        expect(res.statusCode).to.be.equal(400);
      });
    });

    describe("All card number related tests", function () {
      it("Should return 400 if no card number in request body", function () {
        delete body.cardNumber;
        const req = getRequest();
        const res = getResponse();
        const next = sinon.spy();

        valUpdateCardData(req, res, next);

        expect(next.called).to.be.false;
        expect(res.statusCode).to.be.equal(400);
      });

      it("Should return 400 if not a number", function () {
        body.cardNumber = "Test";
        const req = getRequest();
        const res = getResponse();
        const next = sinon.spy();

        valUpdateCardData(req, res, next);

        expect(next.called).to.be.false;
        expect(res.statusCode).to.be.equal(400);
      });

      it("Should return 400 if card number less than 0", function () {
        body.cardNumber = -1;
        const req = getRequest();
        const res = getResponse();
        const next = sinon.spy();

        valUpdateCardData(req, res, next);

        expect(next.called).to.be.false;
        expect(res.statusCode).to.be.equal(400);
      });
    });

    describe("All tests related to player names array", function () {
      it("Should return 400 if playerNames is missing from request body", function () {
        delete body.playerNames;
        const req = getRequest();
        const res = getResponse();
        const next = sinon.spy();

        valUpdateCardData(req, res, next);

        expect(next.called).to.be.false;
        expect(res.statusCode).to.be.equal(400);
      });
      it("Should return 400 if playerNames is not an array", function () {
        body.playerNames = "Love Bhardwaj";
        const req = getRequest();
        const res = getResponse();
        const next = sinon.spy();

        valUpdateCardData(req, res, next);

        expect(next.called).to.be.false;
        expect(res.statusCode).to.be.equal(400);
      });
      it("Should return 400 for playerNames is an empty array", function () {
        body.playerNames = [];
        const req = getRequest();
        const res = getResponse();
        const next = sinon.spy();

        valUpdateCardData(req, res, next);

        expect(next.called).to.be.false;
        expect(res.statusCode).to.be.equal(400);
      });
    });
  });
});
