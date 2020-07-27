const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/authenticateUser");
const appAuth = require("../../middlewares/authenticateApp");
const { User } = require("../../models/user");
const { stringConstants } = require("../../utils/constants");
const { errorObjects } = require("../../utils/errorObjects");
const { createResObject } = require("../../utils/utilFunctions");
const { valUpdateCreditCardRequest } = require("../../middlewares/validation");
const config = require("config");
const stripe = require("stripe")(config.get(stringConstants.STRIPE_TEST_KEY));
const SimpleLogger = require("../../utils/simpleLogger");

router.get("/save-card-client-secret", [appAuth, auth], async (req, res) => {
  let user = await User.findById(req.user._id);
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
    user = await User.findByIdAndUpdate(user, { stripeId: customer.id });
  }

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
  let user = await User.findById(req.user._id);
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
    user = await User.findByIdAndUpdate(user, { stripeId: customer.id });
  }

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
      const card = await updateCard(cardId, expMonth, expYear, fullName);
      // const card = await updateCard("pm_1H6EpqBA2vsISVcRXliuiH5o", 12, 2021);
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

router.delete("/delete-card", [appAuth, auth], async (req, res) => {
  const cardId = req.query.card;
  if (!cardId)
    return res
      .status(400)
      .send(
        createResObject(
          false,
          {},
          stringConstants.REQUEST_VALIDATION_FAILED,
          errorObjects.REQUEST_VALIDATION_ERROR(
            "No card found in query parameters"
          )
        )
      );
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
});

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

async function updateCard(paymentMethodId, expMonth, expYear, fullName) {
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
          billing_details: {
            name: fullName,
          },
          card: {
            exp_month: expMonth,
            exp_year: expYear,
          },
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
