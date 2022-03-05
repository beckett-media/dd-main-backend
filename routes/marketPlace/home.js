const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const auth = require("../../middlewares/authenticateUser");
const publicRouteAuth = require("../../middlewares/publicRouteAuth");
const appAuth = require("../../middlewares/authenticateApp");
const {
  valCardPost,
  valMarketPlaceCardData,
  valObjectIdInUrl,
} = require("../../middlewares/validation");
const SimpleLogger = require("../../utils/simpleLogger");
const path = require("path");
const fsPromises = require("fs").promises;
const _ = require("lodash");
const Jimp = require("jimp");

const { valPageSizeNumber } = require("../../middlewares/validation");
const { Marketplace } = require("../../models/marketplace");
const { User } = require("../../models/user");
const { Card } = require("../../models/card");
const { Product } = require("../../models/product");
const { Grade } = require("../../models/grade");
const { createResObject } = require("../../utils/utilFunctions");
const { stringConstants } = require("../../utils/constants");
const { errorObjects } = require("../../utils/errorObjects");
const { uploadMultiImage } = require("../../middlewares/multerSingle");
const { Listing } = require("../../models/listing");
const { Order } = require("../../models/order");
const { Store } = require("../../models/store");
const { Auction } = require("../../models/auction.model");

/**
 * Route to get all marketplace data
 */
router.get("/", [appAuth, publicRouteAuth], async (req, res) => {
  const pageSize = 10;
  const pageNumber = 1;
  const userId = req.user ? req.user._id : "";
  const arivalCondition = {
    $match: {
      $and: [
        { isPublic: true },
        { auctionId: null },
        { status: stringConstants.listingState.LISTING_SALE },
      ],
    },
  };

  const products = await Product.find();
  const grade = await Grade.find();
  const newArrivals = await filterData(arivalCondition, pageSize, pageNumber);
  const newStores = await filterStoreData(4, pageNumber);
  const newAuctions = await filterAuctionData();

  const trendingLisitnProduct = await Order.aggregate([
    {
      $lookup: {
        from: "listings",
        localField: "listing",
        foreignField: "_id",
        as: "card",
      },
    },
    { $unwind: { path: "$card" } },
    {
      $lookup: {
        from: "products",
        localField: "card.product",
        foreignField: "_id",
        as: "card.product",
      },
    },
    { $unwind: { path: "$card.product" } },
    {
      $lookup: {
        from: "users",
        localField: "card.user",
        foreignField: "_id",
        as: "card.user",
      },
    },
    { $unwind: { path: "$card.user" } },
    {
      $group: {
        _id: "$card.product._id",
      },
    },
    { $sort: { _id: -1 } },
    { $limit: 50 },
  ]);
  let trendingLisitnProductId = trendingLisitnProduct.map((element, idx) => {
    return element._id;
  });
  let cardCondition = "";
  if (userId === "") {
    cardCondition = {
      $match: {
        $and: [
          { product: { $in: trendingLisitnProductId } },
          // { user: { $ne: userId } },

          { isPublic: true },
          { status: stringConstants.listingState.LISTING_SALE },
        ],
      },
    };
  } else {
    cardCondition = {
      $match: {
        $and: [
          { product: { $in: trendingLisitnProductId } },
          { user: { $ne: userId } },

          { isPublic: true },
          { status: stringConstants.listingState.LISTING_SALE },
        ],
      },
    };
  }

  const trendingCards = await filterData(cardCondition, pageSize, pageNumber);
  // trading list for current user
  let playerCondition = "";
  if (userId === "") {
    playerCondition = {
      $match: {
        $and: [
          { product: { $in: trendingLisitnProductId } },
          // { user: { $ne: userId } },
          { isPublic: true },
          { status: stringConstants.listingState.LISTING_SALE },
          { $expr: { $gte: [{ $size: "$playerNames" }, 1] } },
        ],
      },
    };
  } else {
    playerCondition = {
      $match: {
        $and: [
          { product: { $in: trendingLisitnProductId } },
          { user: { $ne: userId } },
          { isPublic: true },
          { status: stringConstants.listingState.LISTING_SALE },
          { $expr: { $gte: [{ $size: "$playerNames" }, 1] } },
        ],
      },
    };
  }

  const trendingPlayers = await filterData(
    playerCondition,
    pageSize,
    pageNumber
  );
  // check order for current user recommendation list
  let checkCurrentUserOrder = "";
  if (userId === "") {
    checkCurrentUserOrder = await Order.find().distinct("listing");
  } else {
    checkCurrentUserOrder = await Order.find({ buyer: userId }).distinct(
      "listing"
    );
  }

  const recommendationListByPrice = await Listing.aggregate([
    {
      $match: {
        _id: { $in: checkCurrentUserOrder },
      },
    },
    { $project: { max: { $max: "$price" }, min: { $min: "$price" } } },
  ]);
  let recomendCondition = "";
  if (userId === "") {
    recomendCondition = {
      $match: {
        $and: [
          // { user: { $ne: mongoose.Types.ObjectId(userId) } },
          {
            price: {
              $gte:
                recommendationListByPrice.length > 0
                  ? recommendationListByPrice[0].min
                  : 1,
              $lte:
                recommendationListByPrice.length > 0
                  ? recommendationListByPrice[0].max
                  : 10000,
            },
          },
          { auctionId: null },
          { isPublic: true },
          { status: stringConstants.listingState.LISTING_SALE },
        ],
      },
    };
  } else {
    recomendCondition = {
      $match: {
        $and: [
          { user: { $ne: mongoose.Types.ObjectId(userId) } },
          {
            price: {
              $gte:
                recommendationListByPrice.length > 0
                  ? recommendationListByPrice[0].min
                  : 1,
              $lte:
                recommendationListByPrice.length > 0
                  ? recommendationListByPrice[0].max
                  : 10000,
            },
          },
          { auctionId: null },
          { isPublic: true },
          { status: stringConstants.listingState.LISTING_SALE },
        ],
      },
    };
  }

  const recommendation = await filterData(
    recomendCondition,
    pageSize,
    pageNumber
  );
  return res.send(
    createResObject(
      true,
      {
        products: products,
        grades: grade,
        newArrival: newArrivals,
        trendingCards: trendingCards,
        trendingPlayers: trendingPlayers,
        recommendation: recommendation,
        newStores,
        newAuctions,
      },
      stringConstants.FETCH_SUCESSFUL
    )
  );
});

/**
 * Route to get filters ( show all ) by pagination
 */

router.get(
  "/:filter/:pageSize/:pageNumber",
  [appAuth, publicRouteAuth, valPageSizeNumber],
  async (req, res) => {
    const pageSize = parseInt(req.params.pageSize);
    const pageNumber = parseInt(req.params.pageNumber);
    const filter = req.params.filter;
    const userId = req.user ? req.user._id : "";
    if (filter === "newArrival") {
      const condition = {
        $match: {
          $and: [
            { isPublic: true },
            { status: stringConstants.listingState.LISTING_SALE },
          ],
        },
      };
      const arrivals = await filterData(condition, pageSize, pageNumber);
      return res.send(
        createResObject(true, arrivals, stringConstants.FETCH_SUCESSFUL)
      );
    } else if (filter === "cards") {
      const trendingLisitnProduct = await Order.aggregate([
        {
          $lookup: {
            from: "listings",
            localField: "listing",
            foreignField: "_id",
            as: "card",
          },
        },
        { $unwind: { path: "$card" } },
        {
          $lookup: {
            from: "products",
            localField: "card.product",
            foreignField: "_id",
            as: "card.product",
          },
        },
        { $unwind: { path: "$card.product" } },
        {
          $lookup: {
            from: "users",
            localField: "card.user",
            foreignField: "_id",
            as: "card.user",
          },
        },
        { $unwind: { path: "$card.user" } },
        {
          $group: {
            _id: "$card.product._id",
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 100 },
      ]);
      let trendingLisitnProductId = trendingLisitnProduct.map(
        (element, idx) => {
          return element._id;
        }
      );

      let condition = "";
      if (userId === "") {
        condition = {
          $match: {
            $and: [
              { product: { $in: trendingLisitnProductId } },
              // { user: { $ne: userId } },

              { isPublic: true },
              { status: stringConstants.listingState.LISTING_SALE },
            ],
          },
        };
      } else {
        condition = {
          $match: {
            $and: [
              { product: { $in: trendingLisitnProductId } },
              { user: { $ne: userId } },

              { isPublic: true },
              { status: stringConstants.listingState.LISTING_SALE },
            ],
          },
        };
      }

      const cards = await filterData(condition, pageSize, pageNumber);
      return res.send(
        createResObject(true, cards, stringConstants.FETCH_SUCESSFUL)
      );
    }
    // trading list for current user
    else if (filter === "players") {
      const trendingLisitnProduct = await Order.aggregate([
        {
          $lookup: {
            from: "listings",
            localField: "listing",
            foreignField: "_id",
            as: "card",
          },
        },
        { $unwind: { path: "$card" } },
        {
          $lookup: {
            from: "products",
            localField: "card.product",
            foreignField: "_id",
            as: "card.product",
          },
        },
        { $unwind: { path: "$card.product" } },
        {
          $lookup: {
            from: "users",
            localField: "card.user",
            foreignField: "_id",
            as: "card.user",
          },
        },
        { $unwind: { path: "$card.user" } },
        {
          $group: {
            _id: "$card.product._id",
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 100 },
      ]);
      let trendingLisitnProductId = trendingLisitnProduct.map(
        (element, idx) => {
          return element._id;
        }
      );

      let condition = "";
      if (userId === "") {
        condition = {
          $match: {
            $and: [
              { product: { $in: trendingLisitnProductId } },
              // { user: { $ne: userId } },
              { isPublic: true },
              { status: stringConstants.listingState.LISTING_SALE },
              { $expr: { $gte: [{ $size: "$playerNames" }, 1] } },
            ],
          },
        };
      } else {
        condition = {
          $match: {
            $and: [
              { product: { $in: trendingLisitnProductId } },
              { user: { $ne: userId } },
              { isPublic: true },
              { status: stringConstants.listingState.LISTING_SALE },
              { $expr: { $gte: [{ $size: "$playerNames" }, 1] } },
            ],
          },
        };
      }

      const cards = await filterData(condition, pageSize, pageNumber);
      return res.send(
        createResObject(true, cards, stringConstants.FETCH_SUCESSFUL)
      );
    }

    // check order for current user recommendation list
    else if (filter === "recommended") {
      let checkCurrentUserOrder = "";
      if (userId === "") {
        checkCurrentUserOrder = await Order.find().distinct("listing");
      } else {
        checkCurrentUserOrder = await Order.find({
          buyer: userId,
        }).distinct("listing");
      }

      const recommendationListByPrice = await Listing.aggregate([
        {
          $match: {
            _id: { $in: checkCurrentUserOrder },
          },
        },
        { $project: { max: { $max: "$price" }, min: { $min: "$price" } } },
      ]);
      let condition = "";
      if (userId === "") {
        condition = {
          $match: {
            $and: [
              // { user: { $ne: mongoose.Types.ObjectId(userId) } },
              {
                price: {
                  $gte:
                    recommendationListByPrice.length > 0
                      ? Math.min(
                          ...recommendationListByPrice.map((elt) => elt.min)
                        )
                      : 1,
                  $lte:
                    recommendationListByPrice.length > 0
                      ? Math.min(
                          ...recommendationListByPrice.map((elt) => elt.max)
                        )
                      : 10000,
                },
              },

              { isPublic: true },
              { status: stringConstants.listingState.LISTING_SALE },
            ],
          },
        };
      } else {
        condition = {
          $match: {
            $and: [
              { user: { $ne: mongoose.Types.ObjectId(userId) } },
              {
                price: {
                  $gte:
                    recommendationListByPrice.length > 0
                      ? Math.min(
                          ...recommendationListByPrice.map((elt) => elt.min)
                        )
                      : 1,
                  $lte:
                    recommendationListByPrice.length > 0
                      ? Math.min(
                          ...recommendationListByPrice.map((elt) => elt.max)
                        )
                      : 10000,
                },
              },

              { isPublic: true },
              { status: stringConstants.listingState.LISTING_SALE },
            ],
          },
        };
      }

      const recommanded = await filterData(condition, pageSize, pageNumber);
      return res.send(
        createResObject(true, recommanded, stringConstants.FETCH_SUCESSFUL)
      );
    } else {
      return res.send(
        createResObject(true, {}, stringConstants.FETCH_SUCESSFUL)
      );
    }
  }
);

/**
 * Route to get listing by products with pagination
 */

router.get(
  "/product/:productType/:pageSize/:pageNumber",
  [appAuth, valPageSizeNumber],
  async (req, res) => {
    const pageSize = parseInt(req.params.pageSize);
    const pageNumber = parseInt(req.params.pageNumber);
    const filter = req.params.productType;
    // const userId = req.user._id;
    // const user = await User.findById(userId);
    // if (!user)
    // 	return res
    // 		.status(404)
    // 		.send(
    // 			createResObject(
    // 				false,
    // 				{},
    // 				stringConstants.USER_ID_DOEST_NOT_EXISTS,
    // 				errorObjects.USER_ID_DOEST_NOT_EXISTS
    // 			)
    // 		);

    const condition = {
      $match: {
        $and: [
          { product: filter },
          { isPublic: true },
          { auctionId: null },
          { status: stringConstants.listingState.LISTING_SALE },
        ],
      },
    };
    const listing = await filterData(condition, pageSize, pageNumber);
    return res.send(
      createResObject(true, listing, stringConstants.FETCH_SUCESSFUL)
    );
  }
);

/**
 * Route to get listing by grade with pagination
 */

router.get(
  "/grade/:gradeType/:pageSize/:pageNumber",
  [appAuth, valPageSizeNumber],
  async (req, res) => {
    const pageSize = parseInt(req.params.pageSize);
    const pageNumber = parseInt(req.params.pageNumber);
    const filter = req.params.gradeType;
    const condition = {
      $match: {
        $and: [
          { grade: filter },
          { isPublic: true },
          { status: stringConstants.listingState.LISTING_SALE },
        ],
      },
    };
    const listing = await filterData(condition, pageSize, pageNumber);
    return res.send(
      createResObject(true, listing, stringConstants.FETCH_SUCESSFUL)
    );
  }
);

let filterData = async (condition, pageSize, pageNumber) => {
  const data = await Listing.aggregate([
    condition,
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "seller",
      },
    },
    { $unwind: { path: "$seller" } },
    {
      $lookup: {
        let: {
          cardObjId: {
            $cond: {
              if: { card: { $ne: ["$card", ""] } },
              then: "$card",
              else: { $toObjectId: "$card" },
            },
          },
        },
        from: "cards",
        pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$cardObjId"] } } }],
        as: "cardDetail",
      },
    },
    { $unwind: { path: "$cardDetail", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: "$_id",
        tags: "$tags",
        images: "$images",
        product: "$product",
        grade: "$grade",
        title: "$title",
        description: "$description",
        price: "$price",
        condition: "$condition",
        isPublic: "$isPublic",
        status: "$status",
        playerNames: "$playerNames",
        updatedAt: "$updatedAt",
        card: "$cardDetail",
        seller: {
          _id: "$seller._id",
          fullName: "$seller.fullName",
          email: "$seller.email",
        },
      },
    },
    { $skip: (pageNumber - 1) * pageSize },
    { $sort: { updatedAt: -1 } },
    { $limit: pageSize },
  ]);
  return data;
};

let filterStoreData = async (pageSize, pageNumber) => {
  const stores = await Store.aggregate([
    { $match: { user: { $exists: true, $ne: null } } },
    { $skip: (pageNumber - 1) * pageSize },
    { $sort: { updatedAt: -1 } },
    { $limit: pageSize },
  ]);

  return stores;
};

let filterAuctionData = async () => {
  const auctions = await Auction.find({})
    .sort("bidStart")
    .limit(4)
    .select("bids bidEnd bidStart startingBid")
    .populate(
      "listing",
      "images product playerNames title is_sale _id brand grade packaging cardType"
    );

  return auctions;
};

module.exports = router;
