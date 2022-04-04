const express = require("express");
const router = express.Router();
const authAdmin = require("../../middlewares/authenticateAdmin");
const appAuth = require("../../middlewares/authenticateApp");
const { valStoreData } = require("../../middlewares/validation");

const { Store } = require("../../models/store");
const { createResObject } = require("../../utils/utilFunctions");

/**
 * POST route to create store
 */
router.post("/create", [appAuth, authAdmin, valStoreData], async (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  const isPublic = req.body.isPublic;
  const images = req.body.images ? req.body.images : [];

  let store = new Store({
    title: title,
    desc: description,
    isPublic: isPublic,
    images: images,
  });
  try {
    store = await store.save();

    return res.send(
      createResObject(true, { store }, "Unclaimed Store Created Successfully")
    );
  } catch (error) {
    SimpleLogger.error(error.message);
    return res.status(400).send(createResObject(false, {}, error.message));
  }
});

module.exports = router;
