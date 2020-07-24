/**
 * All card related routes for admin such as:
 * 1. Grade submitted cards
 */
const express = require("express");
const router = express.Router();
const admin = require("../../middlewares/authenticateAdmin");
const appAuth = require("../../middlewares/authenticateApp");
const { Card } = require("../../models/card");
const { stringConstants } = require("../../utils/constants");
const { errorObjects } = require("../../utils/errorObjects");
const { createResObject, isNumber } = require("../../utils/utilFunctions");

/**
 * Get all the cards that need to be graded
 * After payment has been submitted
 */
router.get("/submitted-cards", [appAuth, admin], async (req, res) => {
  const pageNumber = req.query.pageNumber;
  const pageSize = req.query.pageSize;

  if (!isNumber(pageNumber) || !isNumber(pageSize)) {
    return res
      .status(400)
      .send(
        createResObject(
          false,
          {},
          stringConstants.NEEDS_TO_BE_INTEGER,
          errorObjects.NEEDS_TO_BE_INTEGER("Page number and page size")
        )
      );
  }
  const cardCount = await Card.find({
    status: stringConstants.cardState.SUBMITTED,
  }).lean().length;

  const cards = await Card.find({
    status: stringConstants.cardState.SUBMITTED,
  })
    .skip(pageSize * (pageNumber - 1))
    .limit(pageSize)
    .sort({ updatedAt: 1 });
  return res.send(
    createResObject(true, { cardCount, cards }, stringConstants.FETCH_SUCESSFUL)
  );
});

/**
 * Post route for admin to post the rating of the card
 */

module.exports = router;
