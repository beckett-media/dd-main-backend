const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const auth = require("../../middlewares/authenticateUser");
const appAuth = require("../../middlewares/authenticateApp");
const fs = require("fs");
const {
  valCardPost,
  valLisitngCardData,
  valObjectIdInUrl,
} = require("../../middlewares/validation");
const SimpleLogger = require("../../utils/simpleLogger");
const path = require("path");
const fsPromises = require("fs").promises;
const _ = require("lodash");
const Jimp = require("jimp");

const { valPageSizeNumber } = require("../../middlewares/validation");
const { Listing } = require("../../models/listing");
const { Marketplace } = require("../../models/marketplace");
const { User } = require("../../models/user");
const { Card } = require("../../models/card");
const { Product } = require("../../models/product");
const { Grade } = require("../../models/grade");
const { createResObject } = require("../../utils/utilFunctions");
const { stringConstants } = require("../../utils/constants");
const { errorObjects } = require("../../utils/errorObjects");
const { uploadMultiImage } = require("../../middlewares/multerSingle");
const { Order } = require("../../models/order");
const { StripeConnect } = require("../../models/stripeConnect");
const { OrderItem } = require("../../models/orderItem");

/**
 * Route to get listing by user
 */
router.get(
  "/:pageSize/:pageNumber",
  [appAuth, auth, valPageSizeNumber],
  async (req, res) => {
    const pageSize = parseInt(req.params.pageSize);
    const pageNumber = parseInt(req.params.pageNumber);
    const userId = req.user._id;

    const totalListing = await Listing.find({
      user: userId,
      auctionId: { $eq: null },
      isPublic: req.query.isPublic == "true" ? true : { $in: [true, false] },
    })
      .sort({ createdAt: 1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);
    if (totalListing.length > 0) {
      return res.send(
        createResObject(
          true,
          { listing: totalListing },
          stringConstants.FETCH_SUCESSFUL
        )
      );
    } else {
      return res.send(
        createResObject(true, { listing: [] }, stringConstants.FETCH_SUCESSFUL)
      );
    }
  }
);

/**
 * Route to get list/card detail
 */

router.get("/:cardId", [appAuth], async (req, res) => {
  const cardId = req.params.cardId;
  const cardDetail = await Listing.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(cardId), auctionId: null } },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "seller",
      },
    },
    {
      $lookup: {
        from: "stores",
        localField: "store",
        foreignField: "_id",
        as: "storeDetails",
      },
    },
    { $unwind: { path: "$seller" } },
    { $unwind: { path: "$storeDetails", preserveNullAndEmptyArrays: true } },
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
        card: "$cardDetail",
        description: "$description",
        price: "$price",
        quantity: "$quantity",
        availableQuantity: "$availableQuantity",
        condition: "$condition",
        isPublic: "$isPublic",
        status: "$status",
        playerNames: "$playerNames",
        serialNumber: "$serialNumber",
        cardType: "$cardType",
        sport: "$sport",
        store: "$store",
        cardNumber: "$cardNumber",
        year: "$year",
        brand: "$brand",
        modelNo: "$modelNo",
        seller: {
          _id: "$seller._id",
          fullName: "$seller.fullName",
          email: "$seller.email",
        },
        storeDetails: {
          _id: "$storeDetails._id",
          title: "$storeDetails.title",
        },
      },
    },
  ]);
  return res.send(
    createResObject(true, { cardDetail }, stringConstants.FETCH_SUCESSFUL)
  );
});

/**
 * POST route to add card to listing
 */
router.post(
  "/create",
  [appAuth, auth, valLisitngCardData],
  async (req, res) => {
    const userId = req.user._id;
    const cardId = req.body.cardId;
    const productId = req.body.productId;
    // const productOptionId = req.body.productOptionId;
    const gradeId = req.body.gradeId;
    const title = req.body.title;
    const description = req.body.description;
    const quantity = req.body.quantity;
    const availableQuantity = quantity;
    const price = req.body.price;
    const condition = req.body.condition;
    const serialNumber = req.body.serialNumber;
    const tags = req.body.tags;
    const isPublic = req.body.isPublic;
    const playerNames = req.body.playerNames;
    const cardType = req.body.cardType;
    const sport = req.body.sport;
    const cardNumber = req.body.cardNumber;
    const year = req.body.year;
    const brand = req.body.brand;
    const modelNo = req.body.modelNo;
    const images = req.body.images ? req.body.images : [];
    const user = await User.findById(userId);
    const stripe = await StripeConnect.findOne({
      user: mongoose.Types.ObjectId(userId),
    });
    if (!user)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.USER_ID_DOEST_NOT_EXISTS,
            errorObjects.USER_ID_DOEST_NOT_EXISTS
          )
        );
    if (!stripe)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.STRIPE_CONNECT_ERROR,
            errorObjects.STRIPE_CONNECT_ERROR
          )
        );
    if (cardId !== "") {
      const card = await Card.findById(cardId);
      if (!card)
        return res
          .status(400)
          .send(
            createResObject(
              false,
              {},
              stringConstants.CARD_ID_NOT_FOUND,
              errorObjects.CARD_ID_NOT_FOUND
            )
          );
      const cardInLisitng = await Listing.find({
        card: cardId,
      }).lean();
      if (cardInLisitng && cardInLisitng.length)
        return res
          .status(400)
          .send(
            createResObject(
              false,
              {},
              stringConstants.CARD_ALREADY_EXIST,
              errorObjects.CARD_ALREADY_EXIST
            )
          );
    }

    const product = await Product.findById(productId);
    if (!product)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.PRODUCT_ID_NOT_FOUND,
            errorObjects.PRODUCT_ID_NOT_FOUND
          )
        );
    const grade = await Grade.findById(gradeId);
    if (!grade)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.GRADE_ID_NOT_FOUND,
            errorObjects.GRADE_ID_NOT_FOUND
          )
        );
    // Create a new card in listing
    let listing = new Listing({
      user: userId,
      card: cardId === "" ? null : cardId,
      product: productId,
      grade: gradeId,
      title: title,
      description: description,
      quantity: quantity,
      availableQuantity: availableQuantity,
      price: price,
      condition: condition,
      serialNumber: serialNumber,
      tags: tags,
      isPublic: isPublic,
      playerNames: playerNames,
      cardType: cardType,
      sport: sport,
      cardNumber: cardNumber,
      year: year,
      brand: brand,
      modelNo: modelNo,
      images: images,
    });
    listing = await listing.save();
    if (isPublic) {
      let marketplace = await Marketplace.findOne({ listing: listing._id });
      console.log("marketplace", marketplace);
      if (!marketplace) {
        let addListingMarket = await Marketplace.create({
          listing: listing._id,
          user: userId,
        });
      }
    }

    return res.send(
      createResObject(
        true,
        { listing },
        stringConstants.CARD_ADD_LISTING_SUCCESSFULLY
      )
    );
  }
);

/**
 * Put route to edit the listing
 */
router.put(
  "/:listingId",
  [appAuth, auth, valObjectIdInUrl, valLisitngCardData],
  async (req, res) => {
    const listingId = req.params.listingId;

    const userId = req.user._id;
    const cardId = req.body.cardId;
    const productId = req.body.productId;
    const gradeId = req.body.gradeId;
    const title = req.body.title;
    const description = req.body.description;
    const quantity = req.body.quantity;
    const availableQuantity = quantity;
    const price = req.body.price;
    const condition = req.body.condition;
    const serialNumber = req.body.serialNumber;
    const tags = req.body.tags;
    const isPublic = req.body.isPublic;
    const playerNames = req.body.playerNames;
    const cardType = req.body.cardType;
    const sport = req.body.sport;
    const cardNumber = req.body.cardNumber;
    const year = req.body.year;
    const brand = req.body.brand;
    const modelNo = req.body.modelNo;
    const images = req.body.images ? req.body.images : [];

    const user = await User.findById(userId);

    const listing = await Listing.findById(listingId);
    if (!user)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.USER_ID_DOEST_NOT_EXISTS,
            errorObjects.USER_ID_DOEST_NOT_EXISTS
          )
        );
    if (!listing)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.LISTING_ID_NOT_FOUND,
            errorObjects.LISTING_ID_NOT_FOUND
          )
        );

    if (listing.user.toString() !== userId)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.UNAUTHENTICATE_USER,
            errorObjects.UNAUTHENTICATE_USER
          )
        );
    if (listing.status === "sold")
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.LISTING_ALREADY_SOLD,
            errorObjects.LISTING_ALREADY_SOLD
          )
        );
    const product = await Product.findById(productId);
    if (!product)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.PRODUCT_ID_NOT_FOUND,
            errorObjects.PRODUCT_ID_NOT_FOUND
          )
        );

    const grade = await Grade.findById(gradeId);
    if (!grade)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.GRADE_ID_NOT_FOUND,
            errorObjects.GRADE_ID_NOT_FOUND
          )
        );
    let updateListing = await Listing.findByIdAndUpdate(
      listingId,
      {
        $set: {
          user: userId,
          card: cardId === "" ? null : cardId,
          product: productId,
          grade: gradeId,
          title: title,
          description: description,
          quantity: quantity,
          availableQuantity: availableQuantity,
          price: price,
          condition: condition,
          serialNumber: serialNumber,
          tags: tags,
          isPublic: isPublic,
          playerNames: playerNames,
          cardType: cardType,
          sport: sport,
          cardNumber: cardNumber,
          year: year,
          brand: brand,
          modelNo: modelNo,
          images: images && images.length > 0 ? images : listing.images,
        },
      },
      { new: true }
    );

    return res.send(
      createResObject(
        true,
        { updateListing },
        stringConstants.CARD_UPDATE_LISTING_SUCCESSFULLY
      )
    );
  }
);

/**
 *  route to delete the listing by id
 */
router.delete(
  "/:listingId",
  [appAuth, auth, valObjectIdInUrl],
  async (req, res) => {
    const listingId = req.params.listingId;

    const userId = req.user._id;
    const user = await User.findById(userId);

    const listing = await Listing.findById(listingId);
    if (!user)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.USER_ID_DOEST_NOT_EXISTS,
            errorObjects.USER_ID_DOEST_NOT_EXISTS
          )
        );
    if (!listing)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.LISTING_ID_NOT_FOUND,
            errorObjects.LISTING_ID_NOT_FOUND
          )
        );

    if (listing.user.toString() !== userId)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.UNAUTHENTICATE_USER,
            errorObjects.UNAUTHENTICATE_USER
          )
        );
    await Listing.deleteOne({
      _id: mongoose.Types.ObjectId(listingId),
    });

    return res.send(
      createResObject(true, {}, stringConstants.LISTING_DELETE_SUCCESSFULLY)
    );
  }
);

/**
 *  route to update listing by images
 */
router.post(
  "/update-lsiting-images/:listingId",
  [auth, valObjectIdInUrl],
  async (req, res) => {
    const cardId = req.params.listingId;
    const userId = req.user._id;
    let listing = await Listing.findById(cardId);
    if (!listing) {
      return res
        .status(404)
        .send(
          createResObject(
            false,
            {},
            stringConstants.CARD_ID_NOT_FOUND,
            errorObjects.CARD_ID_NOT_FOUND
          )
        );
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

    // Upload the images of the listing
    req.cardId = cardId;
    uploadMultiImage(req, res, async function (err) {
      if (err) {
        SimpleLogger.error(err);
        // If file type error return relavent message
        if (err.message === stringConstants.NOT_A_VALID_FILE_TYPE) {
          return res
            .status(415)
            .send(
              createResObject(
                false,
                {},
                stringConstants.FILE_TYPE_NOT_ACCEPTED,
                errorObjects.FILE_TYPE_NOT_ACCEPTED
              )
            );
        }
        // Otherwise return unsuspected error
        return res.status(400).send(createResObject(false, {}, err, err));
      }

      // Check files exists
      if (!req.files)
        return res
          .status(400)
          .send(
            createResObject(
              false,
              {},
              stringConstants.NO_FILE_FOUND,
              errorObjects.NO_FILE_FOUND
            )
          );
      // Check files size if corrupt delete the uploaded file
      let images = [];
      if (req.files.length > 0) {
        for (const file of req.files) {
          if (file.size <= 0) {
            const cardDestination = path.join(
              __dirname,
              "../../public/",
              `${userId}/listing/${cardId}/`,
              `${req.file.filename}`
            );
            try {
              await fsPromises.unlink(cardDestination);
            } catch (err) {
              SimpleLogger.error(err);
              await new PendingDeletion({
                deletionType: stringConstants.deletionType.FILE,
                data: cardDestination,
              }).save();
            }
            return res
              .status(400)
              .send(
                createResObject(
                  false,
                  {},
                  stringConstants.FILE_CORRUPTED,
                  errorObjects.FILE_CORRUPTED
                )
              );
          }
          images.push(path.join(`${userId}/listing/${cardId}/`, file.filename));
        }
      }
      if (listing.images && listing.images.length > 0) {
        let arr = [...listing.images, ...images];
        listing.images = arr;
      } else {
        listing.images = images;
      }

      listing = await listing.save();

      return res.send(
        createResObject(true, { listing }, stringConstants.UPDATE_SUCCESSFUL)
      );
    });
  }
);

/**
 *  route to remove the image of a listing
 */
router.delete(
  "/image/:listingId",
  [appAuth, auth, valObjectIdInUrl],
  async (req, res) => {
    const cardId = req.params.listingId;
    const userId = req.user._id;
    const fileName = req.body.fileName;
    let listing = await Listing.findById(cardId);
    if (!listing) {
      return res
        .status(404)
        .send(
          createResObject(
            false,
            {},
            stringConstants.CARD_ID_NOT_FOUND,
            errorObjects.CARD_ID_NOT_FOUND
          )
        );
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
      const filePath = path.join(__dirname, "../../public/", fileName);
      console.log("filePath", filePath);
      if (fs.existsSync(filePath)) {
        await fs.unlinkSync(filePath);
      }

      await Listing.updateOne(
        { _id: listing._id },
        { $pull: { images: fileName } }
      );
      return res.send(
        createResObject(true, {}, stringConstants.IMAGE_REMOVE_SUCCESSFULLY)
      );
    } catch (err) {
      return res.send(createResObject(false, {}, err.message));
    }
  }
);

/**
 * POST route to add a listing into marketplace
 */

router.post(
  "/add-marketplace/:listingId",
  [appAuth, auth, valObjectIdInUrl],
  async (req, res) => {
    const cardId = req.params.listingId;
    const userId = req.user._id;
    let listing = await Listing.findById(cardId);
    if (!listing) {
      return res
        .status(404)
        .send(
          createResObject(
            false,
            {},
            stringConstants.CARD_ID_NOT_FOUND,
            errorObjects.CARD_ID_NOT_FOUND
          )
        );
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
    if (userId !== listing.user.toString())
      return res
        .status(401)
        .send(
          createResObject(
            false,
            {},
            stringConstants.UNAUTHENTICATE_USER,
            errorObjects.UNAUTHENTICATE_USER
          )
        );
    let checkListing = await Marketplace.findOne({ listing: cardId });
    if (checkListing)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.LISTING_EXIST_MARKETPLACE,
            errorObjects.LISTING_EXIST_MARKETPLACE
          )
        );

    let addMarket = await Marketplace.create({
      listing: cardId,
      user: userId,
    });
    let updateListing = await Listing.findByIdAndUpdate(
      cardId,
      { $set: { isPublic: true } },
      { new: true }
    );
    return res.send(
      createResObject(
        true,
        { updateListing },
        stringConstants.LISTING_ADD_MARKETPLACE_SUCCESSFULLY
      )
    );
  }
);

/**
 * Route to get buyer order list
 */
router.get(
  "/invoices/:pageSize/:pageNumber",
  [appAuth, auth, valPageSizeNumber],
  async (req, res) => {
    const pageSize = parseInt(req.params.pageSize);
    const pageNumber = parseInt(req.params.pageNumber);
    const userId = req.user._id;
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

    const buyingListing = await Order.aggregate([
      {
        $match: { buyer: mongoose.Types.ObjectId(userId), status: "completed" },
      },
      {
        $lookup: {
          from: "orderitems",
          localField: "_id",
          foreignField: "parent",
          as: "items",
        },
      },
      { $unwind: { path: "$items", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          let: { sellerId: "$items.seller" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$sellerId"] } } },
            {
              $project: {
                _id: 1,
                fullName: 1,
                email: 1,
              },
            },
          ],
          as: "items.seller",
        },
      },
      { $unwind: { path: "$items.seller", preserveNullAndEmptyArrays: true } },

      {
        $group: {
          _id: "$_id",
          status: { $first: "$status" },
          address: { $first: "$address" },
          price: { $first: "$price" },
          orderId: { $first: "$orderId" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          buyer: { $first: "$buyer" },
          items: { $push: "$items" },
        },
      },
      { $skip: (pageNumber - 1) * pageSize },
      { $sort: { createdAt: 1 } },
      { $limit: pageSize },
    ]);

    return res.send(
      createResObject(true, buyingListing, stringConstants.FETCH_SUCESSFUL)
    );
  }
);

/**
 * Route to get seller order list
 */
router.get(
  "/seller/:pageSize/:pageNumber",
  [appAuth, auth, valPageSizeNumber],
  async (req, res) => {
    const pageSize = parseInt(req.params.pageSize);
    const pageNumber = parseInt(req.params.pageNumber);
    const userId = req.user._id;
    // const userId = "60c1e943ac722e253061a51f";
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
    const orderIds = await OrderItem.find({ seller: userId }).distinct(
      "parent"
    );
    let ids = [];
    if (orderIds.length > 0) {
      ids = orderIds.map((id, i) => {
        return mongoose.Types.ObjectId(id);
      });
    }
    const sellerListing = await Order.aggregate([
      {
        $match: { _id: { $in: ids } },
      },
      {
        $lookup: {
          from: "users",
          let: { buyerId: "$buyer" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$buyerId"] } } },
            {
              $project: {
                _id: 1,
                fullName: 1,
                email: 1,
              },
            },
          ],
          as: "buyer",
        },
      },
      { $unwind: { path: "$buyer", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "orderitems",
          let: { adderId: "$_id" },
          pipeline: [{ $match: { $expr: { $eq: ["$parent", "$$adderId"] } } }],
          as: "items",
        },
      },
      { $unwind: { path: "$items", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "addresses",
          let: { addressId: "$items.address" },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$addressId"] } } }],
          as: "items.address",
        },
      },
      { $unwind: { path: "$items.address", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          let: { buyerId: "$items.buyer" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$buyerId"] } } },
            {
              $project: {
                _id: 1,
                fullName: 1,
                email: 1,
              },
            },
          ],
          as: "items.buyer",
        },
      },
      { $unwind: { path: "$items.buyer", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$_id",
          status: { $first: "$status" },
          address: { $first: "$address" },
          price: { $first: "$price" },
          orderId: { $first: "$orderId" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          buyer: { $first: "$buyer" },
          items: { $push: "$items" },
        },
      },
      { $skip: (pageNumber - 1) * pageSize },
      { $sort: { createdAt: 1 } },
      { $limit: pageSize },
    ]);

    return res.send(
      createResObject(true, sellerListing, stringConstants.FETCH_SUCESSFUL)
    );
  }
);

module.exports = router;
