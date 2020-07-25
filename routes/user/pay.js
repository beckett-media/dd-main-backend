/**
 * Route to accept payments for cards to be review.
 * Card status will move from pending to paid after
 * payment completes
 */
const express = require("express");
const router = express.Router();
const currency = require("../../utils/currency");
const SimpleLogger = require("../../utils/simpleLogger");
const auth = require("../../middlewares/authenticateUser");
const appAuth = require("../../middlewares/authenticateApp");
const { User } = require("../../models/user");
const { Card } = require("../../models/card");
const { stringConstants } = require("../../utils/constants");
const { errorObjects } = require("../../utils/errorObjects");
const { createResObject } = require("../../utils/utilFunctions");
const { valPayPenReq } = require("../../middlewares/validation");
const config = require("config");
const stripe = require("stripe")(config.get(stringConstants.STRIPE_TEST_KEY));
const mongoose = require("mongoose");

router.post(
  "/for-pending-cards",
  [appAuth, auth, valPayPenReq],
  async (req, res) => {
    const userId = req.user._id;
    const amount = currency(req.body.amount).intValue;
    const paymentMethod = req.body.paymentMethod;

    let user = await User.findById(userId);

    // Check if stripe ID, if not then create one
    if (!user.stripeId) {
      let customer;
      try {
        customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: user._id.toString(),
          },
        });
      } catch (err) {
        SimpleLogger.error(err);
        return res
          .status(400)
          .send(
            createResObject(
              false,
              {},
              stringConstants.UNSUSPECTED_ERROR,
              errorObjects.UNSUSPECTED_ERROR(err.message)
            )
          );
      }
      // Everything went well add the ID to customer object
      user = await User.findByIdAndUpdate(
        userId,
        {
          $set: { stripeId: customer.id },
        },
        { new: true }
      );
    }

    const stripeId = user.stripeId;
    //   Get all pedning cards
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
      paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: stringConstants.currency.USD,
        // customer: stripeId,
        customer: "cus_HgxWVGiRx5yRFI",
        payment_method: paymentMethod,
        confirm: true,
        description: "Payment for card grading @ DCGS.AI",
      });
    } catch (error) {
      SimpleLogger.info(error.code);
      SimpleLogger.error(error);
      const pm = error.raw.payment_intent;
      if (pm) {
        SimpleLogger.info(`Payment intent ID that errored out: ${pm.id}`);
      }
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
      const session = await mongoose.startSession();
      try {
        session.startTransaction();
        await Card.updateMany(
          {
            $and: [
              { user: userId },
              { isCompleted: true },
              { status: stringConstants.cardState.PENDING },
            ],
          },
          { $set: { status: stringConstants.cardState.SUBMITTED } },
          { session: session }
        );

        await session.commitTransaction();
        session.endSession();

        return res.send(
          createResObject(
            true,
            { cardsUpdated: cards.length },
            stringConstants.UPDATE_SUCCESSFUL
          )
        );
      } catch (error) {
        // Refund the payment
        await session.abortTransaction();
        session.endSession();

        const refund = await stripe.refunds.create({
          payment_intent: paymentIntent.id,
        });

        return res
          .status(400)
          .send(
            createResObject(
              false,
              {},
              stringConstants.UNSUSPECTED_ERROR,
              errorObjects.UNSUSPECTED_ERROR(error.message)
            )
          );
      }
    }
    return res
      .status(400)
      .send(
        createResObject(
          false,
          {},
          stringConstants.PAYMENT_ERRORED,
          errorObjects.PAYMENT_ERRORED(
            `Payment intetn with ID: ${paymentIntent.id} has failed`
          )
        )
      );
  }
);

module.exports = router;
