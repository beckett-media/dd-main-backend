/**
 * Public card route accesible to general public
 */
const express = require("express");
const router = express.Router();
const { Card } = require("../../models/card");
const { stringConstants } = require("../../utils/constants");
const { createResObject } = require("../../utils/utilFunctions");
const { errorObjects } = require("../../utils/errorObjects");
const {
  valObjectIdInUrl,
  valPageSizeNumber,
} = require("../../middlewares/validation");

router.get("/card-details/:id", valObjectIdInUrl, async (req, res) => {
  const cardId = req.params.id;

  let card = await Card.findById(cardId);

  if (!card)
    return res
      .status(404)
      .send(
        createResObject(
          false,
          {},
          stringConstants.CARD_ID_NOT_FOUND,
          errorObjects.CARD_ID_NOT_FOUND
        )
      );

  card = card.getCardDetails();

  return res.send(
    createResObject(false, { card }, stringConstants.FETCH_SUCESSFUL)
  );
});

/**
 * Route to get all graded cards
 */
router.get(
  "/graded-cards/:pageSize/:pageNumber",
  valPageSizeNumber,
  async (req, res) => {
    const pageSize = parseInt(req.params.pageSize);
    const pageNumber = parseInt(req.params.pageNumber);

    let cards = await Card.find({
      status: stringConstants.cardState.GRADED,
    }).lean();
    const numCards = cards.length;

    cards = await Card.find({ status: stringConstants.cardState.GRADED })
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
module.exports = router;
