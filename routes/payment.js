const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authenticateRequest");
const appAuth = require("../middlewares/appAuth");
const { User } = require("../models/user");
const { stringConstants } = require("../utils/constants");
const { errorObjects } = require("../utils/errorObjects");
const { createResObject } = require("../utils/utilFunctions");
const { valUpdateCreditCardRequest } = require("../middlewares/validation");
const config = require("config");
const stripe = require("stripe")(config.get(stringConstants.STRIPE_TEST_KEY));
const SimpleLogger = require("../utils/simpleLogger");

router.get("/save-card-client-secret", [appAuth, auth], async (req, res) => {
  const user = await User.findById(req.user._id);
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

  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: user.stripeId,
      usage: "on_session",
    });

    return res.send(
      createResObject(
        true,
        { clientSecret: setupIntent.client_secret },
        stringConstants.FETCH_SUCESSFUL
      )
    );
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
});

router.get("/saved-cards", [appAuth, auth], async (req, res) => {
  const user = await User.findById(req.user._id);
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

  try {
    const cards = await getCards(user.stripeId);
    return res.send(
      createResObject(
        true,
        { cards: cards.data },
        stringConstants.FETCH_SUCESSFUL
      )
    );
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
});

router.post(
  "/update-card",
  [appAuth, auth, valUpdateCreditCardRequest],
  async (req, res) => {
    const user = await User.findById(req.user._id);
    const cardId = req.body.cardId;
    const expMonth = req.body.expMonth;
    const expYear = req.body.expYear;
    const fullName = req.body.fullName;
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

    try {
      const card = await updateCard(
        user.stripeId,
        cardId,
        expMonth,
        expYear,
        fullName
      );
      return res.send(
        createResObject(true, { card }, stringConstants.UPDATE_SUCCESSFUL)
      );
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
  }
);

async function getCards(stripeId) {
  return new Promise((resolve, reject) => {
    stripe.paymentMethods.list({ customer: stripeId, type: "card" }, function (
      err,
      paymentMethods
    ) {
      // asynchronously called
      if (err) return reject(err);
      return resolve(paymentMethods);
    });
  });
}

async function updateCard(stripeId, cardId, expMonth, expYear, name) {
  return new Promise((resolve, reject) => {
    stripe.customers.updateSource(
      stripeId,
      cardId,
      { name: name, exp_month: expMonth, exp_year: expYear },
      (err, card) => {
        if (err) return reject(err);
        return resolve(card);
      }
    );
  });
}

module.exports = router;
