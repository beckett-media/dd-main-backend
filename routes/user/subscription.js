const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/authenticateUser");
const appAuth = require("../../middlewares/authenticateApp");
const SimpleLogger = require("../../utils/simpleLogger");
const { Subscription } = require("../../models/subscription");
const { createResObject } = require("../../utils/utilFunctions");
const { stringConstants } = require("../../utils/constants");
const { errorObjects } = require("../../utils/errorObjects");

/**
 * GET route to fetch user details including settins
 */
router.get("/details", [appAuth, auth], async (req, res) => {
    const subscription = await Subscription.findOne({});

    return res.send(
        createResObject(
        true,
        { subscription },
        stringConstants.FETCH_SUCESSFUL
        )
    );
});

module.exports = router;
