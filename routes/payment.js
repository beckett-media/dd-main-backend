const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authenticateRequest");
const appAuth = require("../middlewares/appAuth");
const { User } = require("../models/user");
const { stringConstants } = require("../utils/constants");
const { errorObjects } = require("../utils/errorObjects");
const { createResObject } = require("../utils/utilFunctions");
const {
  valUpdateCreditCardRequest,
  valDeleteCreditCardReq,
} = require("../middlewares/validation");
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
      const card = await updateCard(cardId, expMonth, expYear);
      return res.send(
        createResObject(true, { card }, stringConstants.FETCH_SUCESSFUL)
      );
    } catch (error) {
      SimpleLogger.error(error);
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
);

router.delete(
  "/delete-card",
  [appAuth, auth, valDeleteCreditCardReq],
  async (req, res) => {
    const cardId = req.body.cardId;
    try {
      const card = await deleteCard(cardId);
      return res.send(
        createResObject(true, { card }, stringConstants.DELETED_SUCCESSFULLY)
      );
    } catch (error) {
      SimpleLogger.error(error);
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

async function updateCard(paymentMethodId, expMonth, expYear) {
  // Not sure if these methods can be used with async and await
  // So converting them to async and await form
  return new Promise((resolve, reject) => {
    stripe.paymentMethods.retrieve(paymentMethodId, function (
      err,
      paymentMethod
    ) {
      if (err) return reject(err);
      // Check if a card before updating
      if (paymentMethod.type !== "card")
        return reject("Payment method is not a card");
      stripe.paymentMethods.update(
        paymentMethodId,
        {
          "card.exp_month": expMonth,
          "card.exp_year": expYear,
        },
        function (err, paymentMethod) {
          if (err) return reject(err);
          return resolve(paymentMethod);
        }
      );
    });
  });
}

async function deleteCard(paymentMethodId) {
  return new Promise((resolve, reject) => {
    stripe.paymentMethods.detach(paymentMethodId, (err, paymentMethod) => {
      if (err) return reject(err);
      return resolve(paymentMethod);
    });
  });
}

module.exports = router;
