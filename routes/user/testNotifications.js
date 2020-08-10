const express = require("express");
const router = express.Router();
const appAuth = require("../../middlewares/authenticateApp");
const userAuth = require("../../middlewares/authenticateUser");
const sendNotifications = require("../../utils/sendNotifications");
const Joi = require("@hapi/joi");
const SimpleLogger = require("../../utils/simpleLogger");
const { User } = require("../../models/user");

router.post("/send-test", [appAuth], async (req, res) => {
  const schema = Joi.object({
    deviceTokens: Joi.array().items(Joi.string().required()).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.send(error.message);
  //   const userId = req.user._id;
  //   const user = await User.findById(userId);
  const deviceTokens = req.body.deviceTokens;

  let response;
  try {
    response = await sendNotifications(
      "Test",
      "Tset",
      { name: "Test Object" },
      deviceTokens
    );
  } catch (error) {
    SimpleLogger.error(error);
    return res.send(error.message);
  }
  SimpleLogger.info(JSON.stringify(response));
  return res.send(response);
});
module.exports = router;
