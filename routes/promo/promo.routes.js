const express = require("express");
const appAuth = require("../../middlewares/authenticateApp");
const authAdminOrUser = require("../../middlewares/authenticateAdminOrUser");
const authAdmin = require("../../middlewares/authenticateAdmin");
const { promoController } = require("../../controllers");
const { promoValidation } = require("../../middlewares/validators/");

const router = express.Router();

router.post(
  "/",
  [appAuth, authAdminOrUser, promoValidation.createPromo],
  promoController.createPromo
);
router.get("/", [appAuth, authAdminOrUser], promoController.getPromos);
router.post(
  "/:id",
  [appAuth, authAdminOrUser, promoValidation.updatePromo],
  promoController.updatePromo
);
router.get("/:id", [appAuth, authAdminOrUser], promoController.getPromo);
router.delete("/:id", [appAuth, authAdmin], promoController.deletePromo);

module.exports = router;
