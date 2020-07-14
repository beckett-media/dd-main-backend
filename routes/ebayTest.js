/**
 * Test routes for testing ebay auth.
 */

const express = require("express");
const router = express.Router();
const SimpleLogger = require("../utils/simpleLogger");

router.post("/ebay-accepted", (req, res) => {
  SimpleLogger.info(req.body);
  SimpleLogger.info(req);
  return res.send("Accepted");
});

router.get("/ebay-accepted", (req, res) => {
  SimpleLogger.info(req.body);
  SimpleLogger.info(req);
  return res.send("Accepted");
});

router.post("/ebay-declined", (req, res) => {
  SimpleLogger.info(req.body);
  SimpleLogger.info(req);
  return res.send("Declined");
});

router.get("/ebay-declined", (req, res) => {
  SimpleLogger.info(req.body);
  SimpleLogger.info(req);
  return res.send("Declined");
});

module.exports = router;
