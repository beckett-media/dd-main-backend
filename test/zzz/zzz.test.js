/**
 * Test has been name zzz since with sort
 * it will run last. Since running last all
 * the cleanup can be performed here
 */
const rimraf = require("rimraf");
const path = require("path");
const { User } = require("../../models/user");

describe("Last run", function () {
  it("Should run last", async function () {
    const absolutePath = path.join(__dirname, "../../public/*");
    const users = await User.find({});
    for (const user of users) {
      await user.remove();
    }
    rimraf.sync(absolutePath);
  });
});
