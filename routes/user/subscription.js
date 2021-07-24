const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/authenticateUser");
const appAuth = require("../../middlewares/authenticateApp");
const { Subscription } = require("../../models/subscription");
const { User } = require("../../models/user");
const { createResObject } = require("../../utils/utilFunctions");
const { stringConstants } = require("../../utils/constants");
const config = require('config');

/**
 * GET route to fetch user details including settins
 */
router.get("/details", [appAuth, auth], async (req, res) => {
    const user = await User.findById(req.user._id);
    const { subscription = {} } = user;
    const { cardsLeft = 0, subId = '' } = subscription;
    const subscriptionData = await Subscription.findOne({});
    const skipPayment = config.get('skipPayment');

    return res.send(
        createResObject(
        true,
        {
            subscription: subscriptionData,
                activePlan: {
                    cardsLeft: skipPayment ? 'Unlimited' : cardsLeft, subId: skipPayment ? 'sub_high' : subId
                }
        },
        stringConstants.FETCH_SUCESSFUL
        )
    );
});

module.exports = router;
