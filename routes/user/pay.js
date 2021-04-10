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
const { valPayPenReq, valPaySubReq } = require("../../middlewares/validation");
const { Transaction } = require("../../models/transaction");
const { Subscription } = require("../../models/subscription");
const { TransactionLog } = require("../../models/transactionLog");
const config = require("config");
const stripe = require("stripe")(config.get(stringConstants.STRIPE_TEST_KEY));
const mongoose = require("mongoose");
const { sendNotiToUser } = require("../../utils/sendNotifications");
const combinedGrading = require('../../grading/combined');
const createGradedImage = require('../../utils/digitalOverlay');

router.post(
  "/for-pending-cards",
  [appAuth, auth],
  async (req, res) => {
    console.log('*******************cards grading has been called********************');
    const userId = req.user._id;
    const user = await User.findById(userId);
    const { subscription = {} } = user;
    let { cardsLeft = 0, subId = '' } = subscription;

    // if no card left in current plan
    if (cardsLeft !== 'Unlimited' && cardsLeft == 0)
    return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.NO_CARDS_LEFT_IN_PLAN,
            errorObjects.NO_CARDS_LEFT_IN_PLAN
          )
        );
    const cardId = req.body.cardId;
    const card = await Card.findById(cardId);

    // if no card found
    if (!card)
    return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.NO_CARD,
            errorObjects.NO_CARD
          )
        );

        // grading of card
        const { front: filePath = '' } = card;

        const grading = await combinedGrading(cardId, filePath);
        if (grading === 0) {
          return res
          .status(500)
          .send(
            createResObject(
              false,
              {},
              stringConstants.API_ERROR,
              errorObjects.API_ERROR
            )
          );
        }

        if (!grading.success) {
          return res
          .status(500)
          .send(
            createResObject(
              false,
              {},
              grading.error,
              {
                errorCode: 444,
                errorSubCode: 'API_ERROR',
                errorMessage: grading.error
              }
            )
          );
        }

        // create card grading image
        await createGradedImage(card);

        // check for value returned
        await Card.findByIdAndUpdate(
          cardId,
          { $set: { status: stringConstants.cardState.GRADED, grading } }
        );

        // reducing cards left in subscription by 1
        await User.findByIdAndUpdate(
          userId,
          { $set: {
            subscription: {
              cardsLeft: cardsLeft === 'Unlimited' ? 'Unlimited' : typeof cardsLeft === 'string' ? (parseInt(cardsLeft, 10) - 1).toString() : (cardsLeft - 1).toString(),
              subId
            }
          } },
          { new: true }
        );

        return res.send(
          createResObject(
            true,
            { clientSecret: null, cardsUpdated: 1 },
            'Card Graded Successfully'
          )
        );
  }
)

/**
 * Stripe webhook to listen for async payment processing
 */
router.post("/webhook", async (req, res, next) => {
  console.log('####################### Webhooks Called ########################');
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
      session.startTransaction();
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
        return res.send(
          `Transaction with payment intent ID: ${paymentIntent.id} not found!`
        );
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
        transactionLog = await transactionLog.save(session);
        return res.send(
          `No cards found under transaction with id: ${transaction._id}`
        );
      }
      let cards = [];

      for (const cardId of cardIds) {
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

      const user = await User.findById(transaction.user);
      // Send notifications
      await sendNotiToUser(user, {
        title: "DCGS: Payment successful",
        body: "Payment successful, subscription is now active",
        data: {},
      });

      return res.send();
    } catch (error) {
      SimpleLogger.error(error);
      await session.abortTransaction();
      session.endSession();

      const refund = await stripe.refunds.create({
        payment_intent: paymentIntent.id,
      });

      if (transaction) {
        transaction.status = stringConstants.transactionStatus.REFUNDED;
        transaction.desc = `${transaction.piId} has been refunded ${refund.id}`;

        transaction = await transaction.save();

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

      return res.send(`${transaction.piId} has been refunded ${refund.id}`);
    }
  } else {
    return res.send("Webhook other than payment intent succeeded received.");
  }
});

router.post(
  "/for-subscription",
  [appAuth, auth, valPaySubReq],
  async (req, res) => {
    console.log('*******************Subscription payment has been called********************');
    const userId = req.user._id;
    const amount = currency(req.body.amount).intValue;
    const paymentMethod = req.body.paymentMethod;
    const subscriptionId = req.body.subscriptionId;

    let user = await User.findById(userId);
    let subscriptionFromDB = await Subscription.findOne({});

    const { plans = [] } = subscriptionFromDB;
    const matchedData = plans.find(plan => plan._id === subscriptionId) || {};
    const { price = 0, cards: cardsLeft = 0 } = matchedData;
    if (currency(price).intValue != amount) {
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.AMOUNT_MISMATCH,
            errorObjects.AMOUNT_MISMATCH
          )
        );
    }

    // Check if stripe ID, if not then create one
    if (!user.stripeId) {
      let customer;
      try {
        customer = await stripe.customers.create({
          email: user.email,
          description: stringConstants.STRIPE_CUSTOMER_CREATION_DESC,
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

    // Every check passes then create payment intent
    let paymentIntent;

    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: stringConstants.currency.USD,
        customer: stripeId,
        payment_method: paymentMethod,
        confirm: true,
        description: `Payment for subscription: ${subscriptionId} @ DCGS.AI`,
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

    try {
      switch (paymentIntent.status) {
        case stringConstants.piStatus.SUCCEEDED:
          // success
          user = await User.findByIdAndUpdate(
              userId,
              {
                  $set: {
                      subscription: {
                          subId: subscriptionId,
                          cardsLeft: cardsLeft === 9999999 ? 'Unlimited' : typeof cardsLeft === 'string' ? cardsLeft :  cardsLeft.toString()
                      }
                  }
              }
          );

          return res.send(
            createResObject(
              true,
              { clientSecret: null, subscriptionOpted: true },
              stringConstants.stripeMessages.SUCCEEDED
            )
          );

        case stringConstants.piStatus.REQ_ACTION:
          return res.send(
            createResObject(
              true,
              { clientSecret: paymentIntent.client_secret, subscriptionOpted: false },
              stringConstants.stripeMessages.REQ_ACTION
            )
          );

        case stringConstants.piStatus.PROCESSING:
          return res.send(
            createResObject(
              true,
              { clientSecret: null, subscriptionOpted: false },
              stringConstants.stripeMessages.PROCESSING
            )
          );

        case stringConstants.piStatus.REQ_PM_METHOD:
          return res.send(
            createResObject(
              false,
              {},
              stringConstants.stripeMessages.FAILED,
              errorObjects.STRIPE_ERROR(stringConstants.stripeMessages.FAILED)
            )
          );

        default:
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

      // Try catch block maybe
      if (paymentIntent.status === stringConstants.piStatus.SUCCEEDED) {
        const refund = await stripe.refunds.create({
          payment_intent: paymentIntent.id,
        });
      //   Refunded with ${refund.id}`

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

module.exports = router;
