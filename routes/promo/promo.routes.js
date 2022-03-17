const express = require("express");
const appAuth = require("../../middlewares/authenticateApp");
const authAdminOrUser = require("../../middlewares/authenticateAdminOrUser");
const authAdmin = require("../../middlewares/authenticateAdmin");
const { promoController } = require("../../controllers");
const { promoValidation } = require("../../middlewares/validators/");

const router = express.Router();

router
  .route("/")
  .post(
    [appAuth, authAdminOrUser, promoValidation.createPromo],
    promoController.createPromo
  )
  .get([appAuth, authAdminOrUser], promoController.getPromos);

router
  .route("/:promoId")
  .get(
    [appAuth, authAdminOrUser, promoValidation.getPromo],
    promoController.getPromo
  )
  .patch([promoValidation.updatePromo], promoController.updatePromo)
  .delete(
    [appAuth, authAdmin, promoValidation.deletePromo],
    promoController.deletePromo
  );

module.exports = router;
