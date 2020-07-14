/**
 * Test routes for testing ebay auth.
 */

const express = require("express");
const router = express.Router();
const SimpleLogger = require("../utils/simpleLogger");

router.post("/ebay-accepted", (req, res) => {
  SimpleLogger.info(req.body);
  SimpleLogger.info(req);
});

router.get("/ebay-accepted", (req, res) => {
  SimpleLogger.info(req.body);
  SimpleLogger.info(req);
});

router.post("/ebay-declined", (req, res) => {
  SimpleLogger.info(req.body);
  SimpleLogger.info(req);
});

router.get("/ebay-declined", (req, res) => {
  SimpleLogger.info(req.body);
  SimpleLogger.info(req);
});

module.exports = router;
