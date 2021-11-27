const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const auth = require("../../middlewares/authenticateUser");
const authAdmin = require("../../middlewares/authenticateAdmin");
const authAdminOrUser = require("../../middlewares/authenticateAdminOrUser");
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
 * Route to get store products by user of seller side
 */
router.get(
  "/:store/:pageSize/:pageNumber",
  [appAuth, auth, valPageSizeNumber],
  async (req, res) => {
    const pageSize = parseInt(req.params.pageSize);
    const pageNumber = parseInt(req.params.pageNumber);
    const userId = req.user._id;
    const storeId = req.params.store;

    const totalListing = await Listing.find({ user: userId, store: storeId })
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
 * Route to get stores of admin side
 */

router.get(
  "/get-stores/admin/:pageSize/:pageNumber",
  [appAuth, authAdmin, valPageSizeNumber],
  async (req, res) => {
    const pageSize = parseInt(req.params.pageSize);
    const pageNumber = parseInt(req.params.pageNumber);

    const totalStores = await Store.find({ user: null })
      .sort({ createdAt: 1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);
    if (totalStores.length > 0) {
      return res.send(
        createResObject(
          true,
          { stores: totalStores },
          stringConstants.FETCH_SUCESSFUL
        )
      );
    } else {
      return res.send(
        createResObject(true, { stores: [] }, stringConstants.FETCH_SUCESSFUL)
      );
    }
  }
);

/**
 * Route to get unclaim store
 */
router.get("/publicunclaimed/:store", async (req, res) => {
  const storeId = req.params.store;
  const store = await Store.findById(storeId);

  // if (store.user) {
  //   return res
  //     .status(400)
  //     .send(
  //       createResObject(
  //         false,
  //         {store: "Already claimed"},
  //         stringConstants.STORE_ALREADY_CLAIMED,
  //         errorObjects.STORE_ALREADY_CLAIMED
  //       )
  //     );
  // }

  return res.send(
    createResObject(true, { store }, stringConstants.FETCH_SUCESSFUL)
  );
});

/**
 * Route to get store products on client side
 */
router.get("/public/:store", async (req, res) => {
  const storeId = req.params.store;

  const totalListing = await Listing.find({ store: storeId });
  const store = await Store.findById(storeId).sort({ createdAt: 1 });
  if (totalListing.length > 0) {
    return res.send(
      createResObject(
        true,
        { listing: totalListing, store },
        stringConstants.FETCH_SUCESSFUL
      )
    );
  } else {
    return res.send(
      createResObject(
        true,
        { listing: [], store },
        stringConstants.FETCH_SUCESSFUL
      )
    );
  }
});

/**
 * POST route to create store for seller
 */
router.post("/create", [appAuth, auth, valStoreData], async (req, res) => {
  const userId = req.user._id;
  const title = req.body.title.toLowerCase().trim();
  const description = req.body.description;
  const email = req.body.email;
  const address = req.body.address;
  const phoneNumber = req.body.phoneNumber;
  const isPublic = req.body.isPublic;
  const images = req.body.images ? req.body.images : [];
  const user = await User.findById(userId);
  const stripe = await StripeConnect.findOne({
    user: mongoose.Types.ObjectId(userId),
  });

  let alreadyStore = await Store.findOne({ title });

  if (alreadyStore)
    return res
      .status(400)
      .send(
        createResObject(
          false,
          {},
          stringConstants.STORE_TITLE_ALREADY_EXISTS,
          errorObjects.STORE_TITLE_ALREADY_EXISTS
        )
      );

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
  // Create a new card in listing
  let store = new Store({
    user: userId,
    title: title,
    desc: description,
    isPublic: isPublic,
    images: images,
    address,
    phoneNumber,
    email,
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

/**
 * POST route to create store for admin side
 */
router.post(
  "/admin/create",
  [appAuth, authAdmin, valStoreData],
  async (req, res) => {
    const userId = req.user._id;
    const title = req.body.title.toLowerCase().trim();
    const description = req.body.description;
    const email = req.body.email;
    const address = req.body.address;
    const phoneNumber = req.body.phoneNumber;
    const isPublic = req.body.isPublic;
    const images = req.body.images ? req.body.images : [];
    const user = await User.findById(userId);
    // const stripe = await StripeConnect.findOne({
    //   user: mongoose.Types.ObjectId(userId),
    // });

    let alreadyStore = await Store.findOne({ title });

    if (alreadyStore)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.STORE_TITLE_ALREADY_EXISTS,
            errorObjects.STORE_TITLE_ALREADY_EXISTS
          )
        );

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
    // if (!stripe)
    //   return res
    //     .status(400)
    //     .send(
    //       createResObject(
    //         false,
    //         {},
    //         stringConstants.STRIPE_CONNECT_ERROR,
    //         errorObjects.STRIPE_CONNECT_ERROR
    //       )
    //     );
    // Create a new card in listing
    let store = new Store({
      user: null, //skipped because it is created for a user to be claimed
      title: title,
      desc: description,
      isPublic: isPublic,
      images: images,
      email,
      address,
      phoneNumber,
    });
    store = await store.save();

    return res.send(
      createResObject(
        true,
        { store },
        stringConstants.CARD_ADD_LISTING_SUCCESSFULLY
      )
    );
  }
);

/**
 * Route to get stores by user of seller side
 */

router.get(
  "/:pageSize/:pageNumber",
  [appAuth, auth, valPageSizeNumber],
  async (req, res) => {
    const pageSize = parseInt(req.params.pageSize);
    const pageNumber = parseInt(req.params.pageNumber);
    const userId = req.user._id;

    const totalStores = await Store.find({ user: userId })
      .sort({ createdAt: 1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);
    if (totalStores.length > 0) {
      return res.send(
        createResObject(
          true,
          { stores: totalStores },
          stringConstants.FETCH_SUCESSFUL
        )
      );
    } else {
      return res.send(
        createResObject(true, { stores: [] }, stringConstants.FETCH_SUCESSFUL)
      );
    }
  }
);

/**
 * Route to get store data
 */

router.get("/:storeId", [appAuth, auth], async (req, res) => {
  const storeId = req.params.storeId;
  const userId = req.user._id;

  const store = await Store.findOne({ user: userId, _id: storeId });
  if (store) {
    return res.send(
      createResObject(true, { store }, stringConstants.FETCH_SUCESSFUL)
    );
  } else {
    return res.send(
      createResObject(true, { store: null }, stringConstants.FETCH_SUCESSFUL)
    );
  }
});

/**
 *  route to update store logo
 */
router.post(
  "/update-store-images/:storeId",
  [authAdminOrUser, valObjectIdInUrl],
  async (req, res) => {
    const storeId = req.params.storeId;
    const userId = req.user._id;
    let listing = await Store.findById(storeId);
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
    req.storeId = storeId;
    uploadMultiImageStore(req, res, async function (err) {
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
              `${userId}/stores/${storeId}/`,
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
          images.push(path.join(`${userId}/stores/${storeId}/`, file.filename));
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
 * Put route to edit the listing
 */
router.put(
  "/:storeId/",
  [appAuth, auth, valObjectIdInUrl],
  async (req, res) => {
    const storeId = req.params.storeId;
    console.log(storeId);
    const userId = req.user._id;

    const title = req.body.title;
    const description = req.body.description;
    const email = req.body.email;
    const address = req.body.address;
    const phoneNumber = req.body.phoneNumber;
    const images = req.body.images ? req.body.images : [];

    const user = await User.findById(userId);

    const store = await Store.findById(storeId);
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
    if (!store)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.STORE_ID_DOEST_NOT_EXISTS,
            errorObjects.STORE_ID_DOEST_NOT_EXISTS
          )
        );

    if (store.user.toString() !== userId)
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

    let updatedStore = await Store.findByIdAndUpdate(
      storeId,
      {
        $set: {
          user: userId,
          title: title,
          desc: description,
          email,
          phoneNumber,
          address,
          images: images && images.length > 0 ? images : store.images,
        },
      },
      { new: true }
    );

    return res.send(
      createResObject(
        true,
        { updatedStore },
        stringConstants.STORE_UPDATE_LISTING_SUCCESSFULLY
      )
    );
  }
);

/**
 *  route to remove the image of a listing
 */
router.post(
  "/image/:storeId",
  [appAuth, authAdminOrUser, valObjectIdInUrl],
  async (req, res) => {
    const storeId = req.params.storeId;
    const userId = req.user._id;
    const fileName = req.body.fileName;
    let store = await Store.findById(storeId);
    if (!store) {
      return res
        .status(404)
        .send(
          createResObject(
            false,
            {},
            stringConstants.STORE_ID_NOT_FOUND,
            errorObjects.STORE_ID_NOT_FOUND
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
      if (fs.existsSync(filePath)) {
        await fs.unlinkSync(filePath);
      }

      await Store.updateOne({ _id: store._id }, { $set: { images: fileName } });
      return res.send(
        createResObject(true, {}, stringConstants.IMAGE_REMOVE_SUCCESSFULLY)
      );
    } catch (err) {
      console.log(err);
      return res.send(createResObject(false, {}, err.message));
    }
  }
);

/**
 *  route to delete the store by id
 */
router.delete(
  "/:storeId",
  [appAuth, authAdminOrUser, valObjectIdInUrl],
  async (req, res) => {
    const storeId = req.params.storeId;

    const userId = req.user._id;
    const user = await User.findById(userId);

    const store = await Store.findById(storeId);
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
    if (!store)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.STORE_ID_NOT_FOUND,
            errorObjects.STORE_ID_NOT_FOUND
          )
        );

    if (user.role === "admin") {
      if (store.user)
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
    } else {
      if (store.user.toString() !== userId)
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
    }
    const totalListing = await Listing.find({ store: storeId });

    if (totalListing.length > 0) {
      return res.send(createResObject(false, {}, "STORE NOT DELETED"));
    } else {
      await store.deleteOne({
        _id: mongoose.Types.ObjectId(storeId),
      });

      return res.send(
        createResObject(true, {}, stringConstants.STORE_DELETE_SUCCESSFULLY)
      );
    }
  }
);

module.exports = router;
