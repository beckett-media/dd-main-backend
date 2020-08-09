/**
 * Test route to be deleted in production
 */
const express = require("express");
const router = express.Router();
const { User } = require("../../models/user");
const { createResObject } = require("../../utils/utilFunctions");

router.get("/all-user", async (req, res) => {
  let users = await User.find({});
  users = users.map((user) => {
    return user.getUserDetails();
  });

  return res.send(createResObject(true, { users }, "Fetch successful"));
});
module.exports = router;
