const express = require("express");
const appAuth = require("../../middlewares/authenticateApp");
const authAdminOrUser = require("../../middlewares/authenticateAdminOrUser");
const authAdmin = require("../../middlewares/authenticateAdmin");
const { promoController } = require("../../controllers");
const { promoValidation } = require("../../middlewares/validators/");

const router = express.Router();

router
  .route("/")
  .post([promoValidation.createPromo], promoController.createPromo)
  .get(promoController.getPromos);

router
  .route("/:promoId")
  .post([promoValidation.updatePromo], promoController.updatePromo)
  .get([promoValidation.getPromo], promoController.getPromo)
  .delete([promoValidation.deletePromo], promoController.deletePromo);

module.exports = router;
