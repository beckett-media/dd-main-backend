/**
 * All card related routes for admin such as:
 * 1. Grade submitted cards
 * 2. Submit grading for card
 */
const express = require("express");
const router = express.Router();
const admin = require("../../middlewares/authenticateAdmin");
const appAuth = require("../../middlewares/authenticateApp");
const { Card } = require("../../models/card");
const { stringConstants } = require("../../utils/constants");
const { errorObjects } = require("../../utils/errorObjects");
const { createResObject, isNumber } = require("../../utils/utilFunctions");
const { valPageSizeNumber } = require("../../middlewares/validation");

/**
 * Get all the cards that need to be graded
 * After payment has been submitted
 */
/**
 * Route to get all cards pending grading for user
 */
router.get(
  "/pending-grading-cards/:pageSize/:pageNumber",
  [appAuth, admin, valPageSizeNumber],
  async (req, res) => {
    const pageSize = parseInt(req.params.pageSize);
    const pageNumber = parseInt(req.params.pageNumber);

    let cards = await Card.find({
      status: stringConstants.cardState.SUBMITTED,
    }).lean();
    const numCards = cards.length;

    cards = await Card.find({ status: stringConstants.cardState.SUBMITTED })
      .sort({ createdAt: 1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    return res.send(
      createResObject(
        true,
        { cards: cards, numCards },
        stringConstants.FETCH_SUCESSFUL
      )
    );
  }
);

/**
 * Post route for admin to post the rating of the card
 */

module.exports = router;
