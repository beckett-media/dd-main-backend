/**
 * Route to accept payments for cards to be review.
 * Card status will move from pending to paid after
 * payment completes
 */

const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authenticateRequest");
const currency = require("../utils/currency");
const SimpleLogger = require("../utils/simpleLogger");
const appAuth = require("../middlewares/appAuth");
const { User } = require("../models/user");
const { Card } = require("../models/card");
const { Transaction } = require("../models/transaction");
const { TransactionLog } = require("../models/transactionLog");
const { stringConstants } = require("../utils/constants");
const { errorObjects } = require("../utils/errorObjects");
const { createResObject } = require("../utils/utilFunctions");
const config = require("config");
const stripe = require("stripe")(config.get(stringConstants.STRIPE_TEST_KEY));

router.post("/for-pending-cards", [appAuth, auth], async (req, res) => {
  const userId = req.user._id;
  const amount = currency(req.body.amount).intValue;
  const paymentMethod = req.body.paymentMethod;

  const user = await User.findById(userId);
  if (!user)
    return res
      .status(404)
      .send(
        createResObject(
          false,
          {},
          stringConstants.USER_ID_DOEST_NOT_EXISTS,
          errorObjects.USER_ID_DOEST_NOT_EXISTS
        )
      );

  if (!user.stripeId)
    throw new Error(`${stringConstants.NO_STRIPE_ID_FOUND_FOR_USER}${userId}`);

  const stripeId = user.stripeId;
  //   Get all cards
  const cards = await Card.find({
    $and: [
      { user: userId },
      { isCompleted: true },
      { status: stringConstants.cardState.PENDING },
    ],
  })
    .lean()
    .select("_id");

  // If 0 cards return with error
  if (cards.length <= 0)
    return res
      .status(404)
      .send(
        createResObject(
          false,
          {},
          stringConstants.NO_PEDNING_CARDS_FOUND_FOR_USER,
          errorObjects.NO_PEDNING_CARDS_FOUND_FOR_USER
        )
      );

  // Calculate the amount to be paid and check with amoun from client side
  /**
   * Card pricing:
   * $4.99 for <= 100
   * $7.99 for > 100
   */
  let pendingAmount = 0,
    price = 0;
  const numCards = cards.length;
  if (numCards <= 100) {
    price = "4.99";
    pendingAmount = currency(price).multiply(numCards);
  } else if (numCards > 100) {
    price = "7.99";
    pendingAmount = currency(price).multiply(numCards);
  }
  pendingAmount = currency(pendingAmount).intValue;
  // Return error if does not match
  if (pendingAmount !== amount)
    return res
      .status(400)
      .send(
        createResObject(
          false,
          {},
          stringConstants.PENDING_AMOUNT_AND_AMOUNT_DO_NOT_MATCH,
          errorObjects.PENDING_AMOUNT_AND_AMOUNT_DO_NOT_MATCH
        )
      );
  // Every check passes then create payment intent
  let paymentIntent, transaction, transactionLog;
  //   One database transaction

  try {
    paymentIntent = await stripe.paymentIntent.create({
      amount: amount,
      currency: stringConstants.currency.USD,
      customer: stripeId,
      payment_method: paymentMethod,
      confirm: true,
      description: "Payment for card grading @ DCGS.AI",
    });
  } catch (error) {
    SimpleLogger.error(error);
    const paymentIntentRetrieved = await stripe.paymentIntents.retrieve(
      error.raw.payement_intent.id
    );
    const paymentIntentId = paymentIntentRetrieved.id;
    SimpleLogger.info("Payment id intent that errored: ", paymentIntentId);
    return res
      .status(400)
      .send(
        createResObject(
          false,
          {},
          stringConstants.PAYMENT_ERRORED,
          errorObjects.PAYMENT_ERRORED(error.message)
        )
      );
  }

  // If payment intent succeeded
  if (paymentIntent.status === stringConstants.transactionStatus.SUCCEEDED) {
    //   Preform the update to cards
    for (const card of cards) {
    }
  }
});

module.exports = router;
