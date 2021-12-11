const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const authAdmin = require("../../middlewares/authenticateAdmin");
const appAuth = require("../../middlewares/authenticateApp");
const fs = require("fs");
const {
  valCardPost,
  valStoreData,
  valObjectIdInUrl,
} = require("../../middlewares/validation");
const SimpleLogger = require("../../utils/simpleLogger");
const path = require("path");
const fsPromises = require("fs").promises;
const _ = require("lodash");
const Jimp = require("jimp");

const { valPageSizeNumber } = require("../../middlewares/validation");
const { Store } = require("../../models/store");
const { Marketplace } = require("../../models/marketplace");
const { Listing } = require("../../models/listing");
const { User } = require("../../models/user");
const { Card } = require("../../models/card");
const { Product } = require("../../models/product");
const { Grade } = require("../../models/grade");
const { createResObject } = require("../../utils/utilFunctions");
const { stringConstants } = require("../../utils/constants");
const { errorObjects } = require("../../utils/errorObjects");
const { uploadMultiImageStore } = require("../../middlewares/multerSingle");
const { Order } = require("../../models/order");
const { StripeConnect } = require("../../models/stripeConnect");
const { OrderItem } = require("../../models/orderItem");

/**
 * POST route to create store
 */
router.post("/create", [appAuth, authAdmin, valStoreData], async (req, res) => {
  const userId = req.user._id;
  const title = req.body.title;
  const description = req.body.description;
  const isPublic = req.body.isPublic;
  const images = req.body.images ? req.body.images : [];

  // Create a new card in listing
  let store = new Store({
    title: title,
    desc: description,
    isPublic: isPublic,
    images: images,
  });
  store = await store.save();

  return res.send(
    createResObject(
      true,
      { store },
      stringConstants.CARD_ADD_LISTING_SUCCESSFULLY
    )
  );
});

module.exports = router;
