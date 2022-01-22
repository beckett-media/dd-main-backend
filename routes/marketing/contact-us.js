const express = require("express");
const router = express.Router();
const axios = require("axios");
const config = require("config");
const { createResObject } = require("../../utils/utilFunctions");
const { errorObjects } = require("../../utils/errorObjects");
const { marketingContactUsVal } = require("../../middlewares/validators/index");
const { stringConstants } = require("../../utils/constants");
const sendMail = require("./../../handler/sendMail");

router.post(
  "/duedilly",
  [marketingContactUsVal.valContactUsEmail],
  async (req, res) => {
    try {
      const mail = await sendMail({
        email: "support@duedilly.co",
        subject: "Contact Us Query DueDilly.co",
        text: `We got a contact us request from a user named: ${req.body.name}, email: ${req.body.email} and message: ${req.body.message}`,
      });
      const { success = false } = mail;
      if (success) {
        return res.send(
          createResObject(true, {
            message: "We received your request. We'll get back to you soon.",
          })
        );
      } else {
        return res.send(
          createResObject(false, { message: "Please try again later" })
        );
      }
    } catch (error) {
      return res.send(createResObject(false, { error }));
    }
  }
);

module.exports = router;
