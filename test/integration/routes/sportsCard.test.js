const { User } = require("../../../models/user");
const { Card } = require("../../../models/card");
const path = require("path");
const config = require("config");
const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");

let server, user, token;

describe("INTEG: sportsCard.test.js: /sports-card/add-front Sports card route related test", function () {
  this.beforeEach(async function () {
    server = require("../../../index");
    user = new User({
      email: "test@test.com",
      password: "test_password",
      fullName: "Full Name",
      deviceToken: "test",
      "metadata.osType": "mac_os",
    });
    user = await user.save();
    // Directory to save card will be created by multer
    const tokenObject = user.generateAuthToken();
    token = tokenObject.token;
  });

  this.afterEach(async function () {
    await server.close();
    const users = await User.find({});

    // Remove all
    // Also removes the cards for user
    for (const user of users) {
      await user.remove();
    }
  });

  it("Test 1: Should create a new card and add front to it return 200", async function () {
    // const imagePath = path.join(__dirname, "../../assets/test-image-1.jpg");
    // const res = await request(server)
    //   .post("/sports-card/add-front")
    //   .set({
    //     "x-app-token": config.get("appToken"),
    //     "x-auth-token": token,
    //   })
    //   .attach("cardFront", imagePath);
    // console.log(res.body);
    // expect(res.status).to.be.equal(200);
  });
});
