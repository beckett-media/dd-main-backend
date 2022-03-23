const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const auth = require("../../middlewares/authenticateUser");
const appAuth = require("../../middlewares/authenticateApp");
const _ = require("lodash");
const { Order } = require("../../models/order");
const { createResObject } = require("../../utils/utilFunctions");
const { stringConstants } = require("../../utils/constants");
const { errorObjects } = require("../../utils/errorObjects");
const { Listing } = require("../../models/listing");
const { User } = require("../../models/user");
const { Cart } = require("../../models/cart");
const { Auction } = require("../../models/auction.model");
const config = require("config");
const { StripeConnect } = require("../../models/stripeConnect");
const { OrderLog } = require("../../models/orderLog");
const { OrderItem } = require("../../models/orderItem");
const { valPageSizeNumber } = require("../../middlewares/validation");
const { orderValidation } = require("../../middlewares/validators/");
const { promoService } = require("../../services");
const stripe = require("stripe")(config.get(stringConstants.STRIPE_TEST_KEY));

/**
 * Route to checkout the order and paid to seller
 */
router.post("/checkout", [appAuth, auth], async (req, res) => {
  const userId = req.user._id;
  const cardToken = req.body.cardToken;
  // const customerId = req.body.customerId;
  const addressId = req.body.addressId;
  const isCardSave = req.body.isCardSave;
  const promoCode = req.body.promoCode || "";
  let discount_percentage = 0;
  let promo = undefined;
  if (promoCode !== "") {
    promo = await promoService.getPromoByPromoCode(promoCode);
    discount_percentage = promo.percentage;
  }
  const user = await User.findById(userId);
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
    const listingsIds = await Cart.find({ user: userId }).distinct("listing");
    const amount = await Listing.aggregate([
      { $match: { _id: { $in: listingsIds } } },
      {
        $group: {
          _id: "sum amount",
          totalAmount: { $sum: "$price" },
          count: { $sum: 1 },
        },
      },
    ]);
    let cusId = "";
    if (cardToken !== "") {
      const createCustomer = await stripe.customers.create({
        email: user.email,
        source: cardToken,
        description: "Purchasing sports card",
        metadata: {
          userId: user._id.toString(),
        },
      });
      cusId = createCustomer.id;
      if (isCardSave) {
        await User.findByIdAndUpdate(userId, {
          $set: {
            stripeId: cusId,
          },
        });
      }
    } else {
      cusId = user.stripeId;
      if (cusId === "") {
        return res
          .status(404)
          .send(
            createResObject(
              false,
              {},
              stringConstants.STRIPE_CLIENTID_NOT_FOUND,
              errorObjects.STRIPE_CLIENTID_NOT_FOUND
            )
          );
      }
    }
    const listings = await Listing.find({ _id: { $in: listingsIds } });
    let createOrder;
    if (listings.length > 0) {
      for (const listing of listings) {
        if (listing.auctionId) {
          return res
            .status(401)
            .send(
              createResObject(
                false,
                {},
                stringConstants.ITEM_LISTED_IN_AUCTION_PURCHASE,
                errorObjects.ITEM_LISTED_IN_AUCTION_PURCHASE
              )
            );
        }
      }

      const amountAfterPromo = promoService.getDiscountedAmount(
        amount[0].totalAmount,
        discount_percentage
      );

      const charge = await stripe.charges.create({
        amount: Math.round(amountAfterPromo * 100),
        currency: "usd",
        customer: cusId,
        // card: cardId,
      });
      createOrder = await Order.create({
        buyer: userId,
        address: addressId,
        price: amountAfterPromo,
        originalPrice: amount[0].totalAmount,
        promoId: promo && promo._id,
      });

      for (const list of listings) {
        let fee =
          (list.price * stringConstants.APPLICATION_FEE_PERCENTAGE) / 100;
        const cart = await Cart.findOne({
          listing: mongoose.Types.ObjectId(list.id),
        });
        const stripeObj = await StripeConnect.findOne({
          user: list.user.toString(),
        });
        const discountedAmount = promoService.getDiscountedAmount(
          list.price,
          discount_percentage
        );
        const transfer = await stripe.transfers.create({
          amount: Math.round((discountedAmount - fee) * 100),
          currency: "usd",
          source_transaction: charge.id,
          destination: stripeObj.stripeUserId,
        });

        const item = await Listing.findById(list.id);
        if (item.availableQuantity === cart.quantity) {
          const updateListing = await Listing.findByIdAndUpdate(
            list.id,
            { $set: { status: "sold", availableQuantity: 0 } },
            { new: true }
          );
        } else if (item.availableQuantity > cart.quantity) {
          let quantityLeft = item.availableQuantity - cart.quantity;
          const updateListing = await Listing.findByIdAndUpdate(
            list.id,
            { $set: { availableQuantity: quantityLeft } },
            { new: true }
          );
        }

        const createOrderItem = await OrderItem.create({
          buyer: userId,
          seller: list.user.toString(),
          listing: list.id,
          address: addressId,
          price: discountedAmount,
          title: list.title,
          status: "pending",
          parent: createOrder._id,
          quantity: cart.quantity,
          promoId: promo && promo.id,
          originalPrice: list.price,
        });
        const orderLog = await OrderLog.create({
          response: charge,
          order: createOrder.id,
          buyer: userId,
          listing: list.id,
        });
        await Cart.remove({ _id: cart._id });
      }
      await Order.findByIdAndUpdate(createOrder._id, {
        $set: { status: "completed" },
      });
      return res.send(
        createResObject(true, {}, stringConstants.ORDER_SUCCESSFULLY)
      );
    } else {
      await Order.findByIdAndUpdate(createOrder._id, {
        $set: { status: "incomplete" },
      });
      return res.send(
        createResObject(true, {}, stringConstants.LISTING_NOT_FOUND)
      );
    }
  } catch (e) {
    return res.status(502).send(createResObject(false, {}, e.message, e));
  }
});

// route for buying cards for guests

router.post("/guest-checkout", [appAuth], async (req, res) => {
  const listingId = req.body.listingId;
  const cardToken = req.body.token;
  const quantity = req.body.quantity;
  const email = req.body.email;
  const address = req.body.address;
  try {
    const listingsId = await Listing.findById(listingId);
    if (!listingsId)
      return res
        .status(404)
        .send(
          createResObject(
            false,
            {},
            stringConstants.LISTING_ID_NOT_FOUND,
            errorObjects.LISTING_ID_NOT_FOUND
          )
        );
    const amount = await Listing.aggregate([
      { $match: { _id: { $in: [listingsId._id] } } },
      {
        $group: {
          _id: "sum amount",
          totalAmount: { $sum: "$price" },
          count: { $sum: 1 },
        },
      },
    ]);
    let cusId = "";

    const createCustomer = await stripe.customers.create({
      email,
      source: cardToken,
      description: "Purchasing sports card as guest",
      //   metadata: {
      //     userId: user._id.toString(),
      //   },
    });
    cusId = createCustomer.id;

    const listings = await Listing.find({ _id: { $in: [listingsId] } });
    for (const listing of listings) {
      if (listing.auctionId) {
        return res
          .status(401)
          .send(
            createResObject(
              false,
              {},
              stringConstants.ITEM_LISTED_IN_AUCTION_PURCHASE,
              errorObjects.ITEM_LISTED_IN_AUCTION_PURCHASE
            )
          );
      }
    }
    if (listings.length > 0) {
      const charge = await stripe.charges.create({
        amount: amount[0].totalAmount * 100,
        currency: "usd",
        customer: cusId,
        // card: cardId,
      });

      const createOrder = await Order.create({
        // buyer: userId,
        completeAddress: address,
        price: amount[0].totalAmount,
      });

      for (const list of listings) {
        let fee =
          (list.price * stringConstants.APPLICATION_FEE_PERCENTAGE) / 100;
        // const cart = await Cart.findOne({
        //   listing: mongoose.Types.ObjectId(list.id),
        // });
        const stripeObj = await StripeConnect.findOne({
          user: list.user.toString(),
        });
        const transfer = await stripe.transfers.create({
          amount: (list.price - fee) * 100,
          currency: "usd",
          source_transaction: charge.id,
          destination: stripeObj.stripeUserId,
        });

        const item = await Listing.findById(list.id);
        if (item.availableQuantity === quantity) {
          const updateListing = await Listing.findByIdAndUpdate(
            list.id,
            { $set: { status: "sold", availableQuantity: 0 } },
            { new: true }
          );
        } else if (item.availableQuantity > quantity) {
          let quantityLeft = item.availableQuantity - quantity;
          const updateListing = await Listing.findByIdAndUpdate(
            list.id,
            { $set: { availableQuantity: quantityLeft } },
            { new: true }
          );
        } else {
          createResObject(
            false,
            {},
            stringConstants.LISTING_ID_SOLD,
            errorObjects.LISTING_ID_NOT_FOUND
          );
        }

        const createOrderItem = await OrderItem.create({
          //   buyer: userId,
          seller: list.user.toString(),
          listing: list.id,
          completeAddress: address,
          price: list.price,
          title: list.title,
          status: "pending",
          parent: createOrder._id,
          quantity,
        });
        const orderLog = await OrderLog.create({
          response: charge,
          order: createOrder.id,
          //   buyer: userId,
          listing: list.id,
        });
        // await Cart.remove({ _id: cart._id });
      }
      await Order.findByIdAndUpdate(createOrder._id, {
        $set: { status: "completed" },
      });
      return res.send(
        createResObject(true, {}, stringConstants.ORDER_SUCCESSFULLY)
      );
    } else {
      await Order.findByIdAndUpdate(createOrder._id, {
        $set: { status: "incomplete" },
      });
      return res.send(
        createResObject(true, {}, stringConstants.LISTING_NOT_FOUND)
      );
    }
  } catch (e) {
    return res.status(502).send(createResObject(false, {}, e.message, e));
  }
});

// Route for auction checkout

router.post(
  "/auction-checkout",
  [appAuth, auth, orderValidation.valAuctionCheckout],
  async (req, res) => {
    const currentDate = new Date();
    const userId = req.user._id;
    const cardToken = req.body.cardToken;
    const addressId = req.body.addressId;
    const auctionId = req.body.auctionId;
    const isCardSave = req.body.isCardSave;
    const user = req.user;

    try {
      const auction = await Auction.findById(auctionId).populate("listing");

      if (auction) {
        const previousOrder = await Order.findOne({
          status: "completed",
          auctionId: auction._id,
        });

        if (previousOrder) {
          return res
            .status("400")
            .send(
              createResObject(
                false,
                {},
                "This auction is already paid. Please contact support."
              )
            );
        }

        if (auction.bidEnd >= currentDate) {
          return res
            .status("400")
            .send(createResObject(false, {}, "Auction is not ended yet"));
        }

        if (auction.bids[0].bidder != userId) {
          return res
            .status("400")
            .send(createResObject(false, {}, "You are not the winner"));
        }
      } else {
        return res
          .status(404)
          .send(
            createResObject(
              false,
              {},
              stringConstants.AUCTION_ID_NOT_FOUND,
              errorObjects.AUCTION_ID_NOT_FOUND
            )
          );
      }

      const amount = auction.bids[0].bidAmount;
      let cusId = "";
      if (cardToken !== "") {
        const createCustomer = await stripe.customers.create({
          email: user.email,
          source: cardToken,
          description: "Purchasing sports card in auction",
          metadata: {
            userId: user._id.toString(),
            auctionId: auction._id.toString(),
          },
        });
        cusId = createCustomer.id;
        if (isCardSave) {
          await User.findByIdAndUpdate(userId, {
            $set: {
              stripeId: cusId,
            },
          });
        }
      } else {
        cusId = user.stripeId;
        if (cusId === "") {
          return res
            .status(404)
            .send(
              createResObject(
                false,
                {},
                stringConstants.STRIPE_CLIENTID_NOT_FOUND,
                errorObjects.STRIPE_CLIENTID_NOT_FOUND
              )
            );
        }
      }
      let createOrder;
      if (auction.listing) {
        const charge = await stripe.charges.create({
          amount: amount * 100,
          currency: "usd",
          customer: cusId,
          // card: cardId,
        });
        createOrder = await Order.create({
          buyer: userId,
          address: addressId,
          price: amount,
          auctionId: auction._id,
        });
        let fee = (amount * stringConstants.APPLICATION_FEE_PERCENTAGE) / 100;

        const stripeObj = await StripeConnect.findOne({
          user: auction.seller,
        });
        await stripe.transfers.create({
          amount: (amount - fee) * 100,
          currency: "usd",
          source_transaction: charge.id,
          destination: stripeObj.stripeUserId,
        });

        // need to optimize this, no need to find listing
        if (auction.listing.availableQuantity === 1) {
          await Listing.findByIdAndUpdate(
            auction.listing._id,
            { $set: { status: "sold", availableQuantity: 0 } },
            { new: true }
          );
        } else if (auction.listing.availableQuantity > 1) {
          let quantityLeft = auction.listing.availableQuantity - 1;
          await Listing.findByIdAndUpdate(
            auction.listing._id,
            { $set: { availableQuantity: quantityLeft } },
            { new: true }
          );
        }

        const createOrderItem = await OrderItem.create({
          buyer: userId,
          seller: auction.seller,
          listing: auction.listing._id,
          address: addressId,
          price: auction.bids[0].bidAmount,
          title: auction.listing.title,
          status: "pending",
          parent: createOrder._id,
          quantity: 1,
          auctionId: auction,
        });
        const orderLog = await OrderLog.create({
          response: charge,
          order: createOrder.id,
          buyer: userId,
          listing: auction.listing._id,
          auctionId: auction,
        });
        await Order.findByIdAndUpdate(createOrder._id, {
          $set: { status: "completed" },
        });
        auction.orderId = createOrder._id;
        await auction.save();
        return res.send(
          createResObject(true, {}, stringConstants.AUCTION_ORDER_SUCCESSFULLY)
        );
      } else {
        await Order.findByIdAndUpdate(createOrder._id, {
          $set: { status: "incomplete" },
        });
        return res.send(
          createResObject(true, {}, stringConstants.LISTING_NOT_FOUND)
        );
      }
    } catch (e) {
      return res.status(502).send(createResObject(false, {}, e.message, e));
    }
  }
);

/**
 * Route to filter(status) the orders for seller
 */
router.get("/:filter", [appAuth, auth], async (req, res) => {
  const userId = req.user._id;
  const filter = req.params.filter;
  const user = await User.findById(userId);
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

  const orders = await Order.find({
    seller: userId,
    status: filter,
  }).populate("listing");
  return res.send(
    createResObject(true, { orders }, stringConstants.FETCH_SUCESSFUL)
  );
});

/**
 * Route to change order status for seller
 */
router.post("/status-change/:orderId", [appAuth, auth], async (req, res) => {
  const orderId = req.params.orderId;
  const userId = req.user._id;
  const orderStatus = req.body.status;
  const user = await User.findById(userId);
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
  const order = await Order.findById(orderId);
  if (!order)
    return res
      .status(404)
      .send(
        createResObject(
          false,
          {},
          stringConstants.ORDER_ID_NOT_FOUND,
          errorObjects.ORDER_ID_NOT_FOUND
        )
      );
  if (order.seller.toString() !== user._id.toString())
    return res
      .status(404)
      .send(
        createResObject(
          false,
          {},
          stringConstants.UNAUTHENTICATE_USER,
          errorObjects.UNAUTHENTICATE_USER
        )
      );
  let checkValidStatus = Object.values(stringConstants.orderState).includes(
    orderStatus
  );
  if (!checkValidStatus)
    return res
      .status(401)
      .send(
        createResObject(
          false,
          {},
          stringConstants.INVALID_ORDER_STATUS,
          errorObjects.INVALID_ORDER_STATUS
        )
      );
  const updateOrder = await Order.findByIdAndUpdate(
    orderId,
    { $set: { status: orderStatus } },
    { new: true }
  );
  return res.send(
    createResObject(true, { updateOrder }, stringConstants.ORDER_STATUS_CHANGE)
  );
});

module.exports = router;
