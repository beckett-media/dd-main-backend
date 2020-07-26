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
const { Transaction } = require("../../models/transaction");
const { TransactionLog } = require("../../models/transactionLog");
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
        customer: stripeId,
        // customer: "cus_HgxWVGiRx5yRFI",
        payment_method: paymentMethod,
        confirm: true,
        description: "Payment for card grading @ DCGS.AI",
        receipt_email: user.email,
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

    // Everything else will be done use database transactions
    // The try and catch block will acts as the main block
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      // Create a transaction and relating transaction log
      transaction = new Transaction({
        amount: amount,
        currency: stringConstants.currency.USD,
        status: stringConstants.transactionStatus.CREATED,
        piId: paymentIntent.id,
        desc: "Transaction created in the system",
        user: userId,
        cards: cards,
      });
      transaction = await transaction.save(session);

      transactionLog = new TransactionLog({
        transaction: transaction._id,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        piId: transaction.piId,
        desc: transaction.desc,
        user: transaction.user,
        cards: transaction.cards,
      });

      transactionLog = await transactionLog.save(session);

      switch (paymentIntent.status) {
        case stringConstants.piStatus.SUCCEEDED:
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

          // Update transaction
          transaction.status = stringConstants.piStatus.SUCCEEDED;
          transaction.desc = stringConstants.stripeMessages.SUCCEEDED;
          transaction = await transaction.save(session);

          transactionLog = new TransactionLog({
            transaction: transaction._id,
            amount: transaction.amount,
            currency: transaction.currency,
            status: transaction.status,
            piId: transaction.piId,
            desc: transaction.desc,
            user: transaction.user,
            cards: transaction.cards,
          });

          transactionLog = await transactionLog.save(session);

          await session.commitTransaction();
          session.endSession();

          return res.send(
            createResObject(
              true,
              { cardsUpdated: cards.length },
              stringConstants.stripeMessages.SUCCEEDED
            )
          );

        case stringConstants.piStatus.REQ_ACTION:
          // 3D secure
          transaction.status = stringConstants.piStatus.REQ_ACTION;
          transaction.desc = stringConstants.stripeMessages.REQ_ACTION;
          transaction = await transaction.save(session);

          transactionLog = new TransactionLog({
            transaction: transaction._id,
            amount: transaction.amount,
            currency: transaction.currency,
            status: transaction.status,
            piId: transaction.piId,
            desc: transaction.desc,
            user: transaction.user,
            cards: transaction.cards,
          });

          transactionLog = await transactionLog.save(session);

          await session.commitTransaction();
          session.endSession();

          return res.send(
            createResObject(
              true,
              { paymentIntent },
              stringConstants.stripeMessages.REQ_ACTION
            )
          );

        case stringConstants.piStatus.PROCESSING:
          transaction.status = stringConstants.piStatus.PROCESSING;
          transaction.desc = stringConstants.stripeMessages.PROCESSING;
          transaction = await transaction.save(session);

          transactionLog = new TransactionLog({
            transaction: transaction._id,
            amount: transaction.amount,
            currency: transaction.currency,
            status: transaction.status,
            piId: transaction.piId,
            desc: transaction.desc,
            user: transaction.user,
            cards: transaction.cards,
          });

          transactionLog = await transactionLog.save(session);

          await session.commitTransaction();
          session.endSession();

          return res.send(
            createResObject(
              true,
              { paymentIntent },
              stringConstants.stripeMessages.PROCESSING
            )
          );

        case stringConstants.piStatus.REQ_PM_METHOD:
          // Update transaction and create transaction log
          // Update transaction
          transaction.status = stringConstants.piStatus.REQ_PM_METHOD;
          transaction.desc = "Transaction declined";
          transaction = await transaction.save(session);

          transactionLog = new TransactionLog({
            transaction: transaction._id,
            amount: transaction.amount,
            currency: transaction.currency,
            status: transaction.status,
            piId: transaction.piId,
            desc: transaction.desc,
            user: transaction.user,
            cards: transaction.cards,
          });

          transactionLog = await transactionLog.save(session);

          await session.commitTransaction();
          session.endSession();

          return res.send(
            createResObject(false, {}, stringConstants.stripeMessages.FAILED)
          );

        default:
          transaction.status = paymentIntent.status;
          transaction.desc = "Transaction declined";
          transaction = await transaction.save(session);

          transactionLog = new TransactionLog({
            transaction: transaction._id,
            amount: transaction.amount,
            currency: transaction.currency,
            status: transaction.status,
            piId: transaction.piId,
            desc: transaction.desc,
            user: transaction.user,
            cards: transaction.cards,
          });

          transactionLog = await transactionLog.save(session);

          await session.commitTransaction();
          session.endSession();

          return res.send(
            createResObject(
              false,
              {},
              stringConstants.stripeMessages.FAILED,
              errorObjects.STRIPE_ERROR(stringConstants.stripeMessages.FAILED)
            )
          );
      }
    } catch (error) {
      SimpleLogger.error(error);
      // Refund the payment
      await session.abortTransaction();
      session.endSession();

      // Try catch block maybe
      if (paymentIntent.status === stringConstants.piStatus.SUCCEEDED) {
        const refund = await stripe.refunds.create({
          payment_intent: paymentIntent.id,
        });

        if (transaction) {
          transaction.status = stringConstants.transactionStatus.REFUNDED;
          transaction.desc = `${transaction.piId} has been refunded ${refund.id}`;

          transactionLog = new TransactionLog({
            transaction: transaction._id,
            amount: transaction.amount,
            currency: transaction.currency,
            status: transaction.status,
            piId: transaction.piId,
            desc: transaction.desc,
            user: transaction.user,
            cards: transaction.cards,
          });

          transactionLog = await transactionLog.save();
        }

        return res
          .status(400)
          .send(
            createResObject(
              false,
              {},
              stringConstants.stripeMessages.REFUND,
              errorObjects.STRIPE_ERROR(stringConstants.stripeMessages.REFUND)
            )
          );
      }
    }
  }
);

/**
 * Stripe webhook to listen for async payment processing
 */
router.post("/webhook", async (req, res, next) => {
  // Webhook is specifically for async payment process

  let event, type, paymentIntent, transaction, transactionLog; // Stripe event

  // 1. Parse the stripe event
  try {
    event = req.body;
    type = event.type;
    paymentIntent = event.data.object;
  } catch (error) {
    SimpleLogger.error(error);
    return res.status(400).send(`Webhook error : ${error.message}`);
  }

  const session = await mongoose.startSession();

  if (type === stringConstants.piEvents.PI_SUCCEEDED) {
    try {
      transaction = await Transaction.findOne({
        $and: [
          { piId: paymentIntent.id },
          {
            status: {
              $in: [
                stringConstants.piStatus.REQ_ACTION,
                stringConstants.piStatus.PROCESSING,
              ],
            },
          },
        ],
      });

      if (!transaction) {
        SimpleLogger.error(
          new Error(
            `Transaction with payment intent ID: ${paymentIntent.id} not found!`
          )
        );
        return res.send();
      }

      // Complete the transaction
      const cardIds = transaction.cards;
      if (!cardIds || cardIds.length < 0) {
        SimpleLogger.error(
          new Error(
            `No cards found under transaction with id: ${transaction._id}`
          )
        );

        transactionLog = new TransactionLog({
          transaction: transaction._id,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status,
          piId: transaction.piId,
          desc: "No cards found in transaction",
          user: transaction.user,
          cards: transaction.cards,
        });
        transactionLog = await transactionLog.save();
        return res.send();
      }
      let cards = [];
      for (const cardId in cardIds) {
        const card = await Card.findByIdAndUpdate(
          cardId,
          { $set: { status: stringConstants.cardState.SUBMITTED } },
          { session: session, new: true }
        );
        cards.push(card._id);
      }

      // Update transaction
      transaction.status = stringConstants.piStatus.SUCCEEDED;
      transaction.desc = stringConstants.stripeMessages.SUCCEEDED;
      transaction.cards = cards;
      transaction = await transaction.save(session);

      transactionLog = new TransactionLog({
        transaction: transaction._id,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        piId: transaction.piId,
        desc: transaction.desc,
        user: transaction.user,
      });

      transactionLog = await transactionLog.save(session);

      await session.commitTransaction();
      session.endSession();

      // Send notifications
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      const refund = await stripe.refunds.create({
        payment_intent: paymentIntent.id,
      });

      if (transaction) {
        transaction.status = stringConstants.transactionStatus.REFUNDED;
        transaction.desc = `${transaction.piId} has been refunded ${refund.id}`;

        transactionLog = new TransactionLog({
          transaction: transaction._id,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status,
          piId: transaction.piId,
          desc: transaction.desc,
          user: transaction.user,
          cards: transaction.cards,
        });

        transactionLog = await transactionLog.save();
      }

      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.stripeMessages.REFUND,
            errorObjects.STRIPE_ERROR(stringConstants.stripeMessages.REFUND)
          )
        );
    }
  } else {
    return res.send();
  }
});

module.exports = router;
