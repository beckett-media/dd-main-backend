const { Listing } = require("../models/listing");
const { Auction } = require("../models/auction.model");
const extend = require("lodash/extend");
// const errorHandler = require("../helpers/dbErrorHandler");
const fs = require("fs");
const { createResObject } = require("../utils/utilFunctions");
const { stringConstants } = require("../utils/constants");
const { errorObjects } = require("../utils/errorObjects");

const createAuction = async (req, res) => {
  let listing = await Listing.findById(req.body.listingId);

  if (!listing) {
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
  }

  if (listing.user != req.user._id) {
    return res
      .status(401)
      .send(
        createResObject(
          false,
          {},
          stringConstants.NOT_AUTHORIZED_TO_PERFORM_THE_ACTION,
          errorObjects.NOT_AUTHORIZED_TO_PERFORM_THE_ACTION
        )
      );
  }

  if (listing.quantity < 1) {
    return res
      .status(400)
      .send(
        createResObject(
          false,
          {},
          "No stock available for this product",
          errorObjects.NOT_AUTHORIZED_TO_PERFORM_THE_ACTION
        )
      );
  }

  let prevAuction = await Auction.findOne({ listing: listing._id });

  if (prevAuction) {
    return res
      .status(400)
      .send(
        createResObject(
          false,
          {},
          "Auction already created for this listing",
          errorObjects.NOT_AUTHORIZED_TO_PERFORM_THE_ACTION
        )
      );
  }

  let responseOfDates = verifyAuctionDates(req.body);

  if (responseOfDates && !responseOfDates.status) {
    return res
      .status(400)
      .send(
        createResObject(
          false,
          {},
          responseOfDates.message,
          errorObjects.NOT_AUTHORIZED_TO_PERFORM_THE_ACTION
        )
      );
  }

  let auction = new Auction({ ...req.body, listing: req.body.listingId });
  auction.seller = listing.user;

  try {
    let result = await auction.save();
    return res
      .status(201)
      .send(
        createResObject(
          true,
          { auction: result },
          "Auction created successfully"
        )
      );
  } catch (err) {
    return res
      .status(400)
      .send(
        createResObject(
          false,
          { error: err },
          "Auction not created successfully"
        )
      );
  }
};

const auctionByID = async (req, res) => {
  try {
    let auction = await Auction.findById(req.params.auctionId)
      .populate("seller", "_id name")
      .populate("bids.bidder", "_id name")
      .exec();
    if (!auction)
      return res
        .status("400")
        .send(createResObject(false, {}, stringConstants.AUCTION_ID_NOT_FOUND));
    return res
      .status(200)
      .send(
        createResObject(false, { auction }, stringConstants.FETCH_SUCESSFUL)
      );
  } catch (err) {
    return res
      .status(400)
      .send(
        createResObject(false, { error: err }, "Could not retrieve auction")
      );
  }
};

const update = async (req, res) => {
  let currentDate = new Date();
  let auction = await Auction.findById(req.params.auctionId);
  if (!auction)
    return res
      .status("400")
      .send(createResObject(false, {}, stringConstants.AUCTION_ID_NOT_FOUND));

  let responseOfDates = verifyAuctionDates(req.body);

  if (responseOfDates && !responseOfDates.status) {
    return res
      .status(400)
      .send(
        createResObject(
          false,
          {},
          responseOfDates.message,
          errorObjects.NOT_AUTHORIZED_TO_PERFORM_THE_ACTION
        )
      );
  }

  if (auction.bidEnd <= currentDate) {
    return res
      .status("400")
      .send(
        createResObject(false, {}, "Can't update a auction after it is ended")
      );
  }

  if (
    auction.bidStart != req.body.bidStart &&
    auction.bidStart <= currentDate
  ) {
    return res
      .status("400")
      .send(
        createResObject(
          false,
          {},
          "Can't update auction start time after it is already live"
        )
      );
  }

  auction.bidEnd = req.body.bidEnd;
  auction.bidStart = req.body.bidEnd;
  auction.startingBid = req.body.startingBid;

  try {
    let updatedAuction = await auction.save();
    res.json(
      createResObject(
        true,
        { auction: updatedAuction },
        stringConstants.UPDATE_SUCCESSFUL
      )
    );
  } catch (err) {
    return res.status(400).send(
      createResObject(false, {
        error: err,
      })
    );
  }
};

const remove = async (req, res) => {
  try {
    let auction = await Auction.findByIdAndDelete(req.params.auctionId);
    if (!auction)
      return res
        .status("400")
        .send(createResObject(false, {}, stringConstants.AUCTION_ID_NOT_FOUND));

    res.send(
      createResObject(true, { auction }, stringConstants.DELETED_SUCCESSFULLY)
    );
  } catch (err) {
    return res.status(400).send(
      createResObject(false, {
        error: err,
      })
    );
  }
};

const listOpen = async (req, res) => {
  try {
    let auctions = await Auction.find({ bidEnd: { $gt: new Date() } })
      .sort("bidStart")
      .populate("seller", "_id fullName")
      .populate("bids.bidder", "_id fullName");
    res.send(
      createResObject(true, { auctions }, "Fetched open auctions successfully")
    );
  } catch (err) {
    res
      .status(400)
      .send(
        createResObject(
          false,
          { error: err },
          "Auction not fetched successfully"
        )
      );
  }
};

const listBySeller = async (req, res) => {
  console.log(req.user._id);
  try {
    let auctions = await Auction.find({ seller: req.user._id })
      .populate("listing")
      .populate("bids.bidder", "_id fullName username");
    res.send(
      createResObject(true, { auctions }, "Fetched auctions successfully")
    );
  } catch (err) {
    return res
      .status(400)
      .send(
        createResObject(
          false,
          { error: err },
          "Auction not fetched successfully"
        )
      );
  }
};

const listByBidder = async (req, res) => {
  try {
    let auctions = await Auction.find({ "bids.bidder": req.user._id })
      .populate("seller", "_id fullName profilePicture")
      .populate("bids.bidder", "_id fullName");
    res.send(
      createResObject(true, { auctions }, "Fetched auctions successfully")
    );
  } catch (err) {
    res
      .status(400)
      .send(
        createResObject(
          false,
          { error: err },
          "Auction not fetched successfully"
        )
      );
  }
};

function verifyAuctionDates(body) {
  let currentDate = new Date();
  let bidEnd = new Date(body.bidEnd);
  let bidStart = new Date(body.bidStart);

  if (bidEnd < currentDate) {
    return {
      status: false,
      message: "Auction end date must be in future",
    };
  }

  if (body.bidStart && bidEnd <= bidStart) {
    return {
      status: false,
      message: "Auction end date must greater than start date",
    };
  }

  if (body.bidStart && bidStart < currentDate) {
    return {
      status: false,
      message: "Auction start date can not be in past",
    };
  }
}

module.exports = {
  createAuction,
  auctionByID,
  listOpen,
  listBySeller,
  listByBidder,
  update,
  remove,
};
