const router = require("express").Router();
const appAuth = require("../../middlewares/authenticateApp");
const auth = require("../../middlewares/authenticateUser");
const { auctionController } = require("../../controllers/");
const { auctionValidation } = require("../../middlewares/validators/");

router
  .route("/")
  .post(
    [appAuth, auth, auctionValidation.valCreateAuction],
    auctionController.createAuction
  );
  
router
  .route("/detailed/:auctionId")
  .get([appAuth, auth], auctionController.auctionByIdDetailed);

router
  .route("/:pageSize/:pageNumber")
  .get([appAuth, auth], auctionController.listBySeller);

router
  .route("/open/:productId/:pageSize/:pageNumber")
  .get(auctionController.listOpen);

router.route("/list-by-bidder").get(auctionController.listByBidder);

router
  .route("/:auctionId")
  .put(
    [appAuth, auth, auctionValidation.valUpdateAuction],
    auctionController.update
  )
  .delete([appAuth, auth], auctionController.remove)
  .get(auctionController.auctionByID);

module.exports = router;
