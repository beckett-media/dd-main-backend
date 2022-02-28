const { Listing } = require("../models/listing");
const { Auction } = require("../models/auction.model");
const { createResObject } = require("../utils/utilFunctions");
const { stringConstants } = require("../utils/constants");
const { errorObjects } = require("../utils/errorObjects");
const SimpleLogger = require("../utils/simpleLogger");

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

  if (!listing.isPublic) {
    return res
      .status(400)
      .send(
        createResObject(
          false,
          {},
          stringConstants.PRODUCT_NOT_PUBLIC,
          errorObjects.PRODUCT_NOT_FOUND
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
    listing.auctionId = result.id;
    await listing.save();
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
    SimpleLogger.error(err);

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
      .populate("seller", "_id fullName")
      .populate("bids.bidder", "_id")
      .populate("listing")
      .exec();

    if (!auction)
      return res
        .status("400")
        .send(createResObject(false, {}, stringConstants.AUCTION_ID_NOT_FOUND));

    return res
      .status(200)
      .send(
        createResObject(true, { auction }, stringConstants.FETCH_SUCESSFUL)
      );
  } catch (err) {
    console.log(err);
    SimpleLogger.error(err);

    return res
      .status(400)
      .send(
        createResObject(false, { error: err }, "Could not retrieve auction")
      );
  }
};

const auctionByIdDetailed = async (req, res) => {
  try {
    let auction = await Auction.findById(req.params.auctionId)
      .populate("seller", "_id fullName")
      .populate("bids.bidder", "_id fullName email")
      .populate("listing")
      .exec();

    if (!auction)
      return res
        .status("400")
        .send(createResObject(false, {}, stringConstants.AUCTION_ID_NOT_FOUND));

    if (auction.seller._id != req.user._id)
      return res
        .status("401")
        .send(
          createResObject(
            false,
            {},
            stringConstants.NOT_AUTHORIZED_TO_PERFORM_THE_ACTION,
            errorObjects.NOT_AUTHORIZED_TO_PERFORM_THE_ACTION
          )
        );

    return res
      .status(200)
      .send(
        createResObject(
          true,
          { auction: auction },
          stringConstants.FETCH_SUCESSFUL
        )
      );
  } catch (err) {
    console.log(err);
    SimpleLogger.error(err);

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
          "Can't update auction after it is already live"
        )
      );
  }

  let responseOfDates = verifyAuctionDates(req.body, auction, true);

  if (responseOfDates && !responseOfDates.status) {
    return res
      .status(401)
      .send(
        createResObject(
          false,
          {},
          responseOfDates.message,
          errorObjects.NOT_AUTHORIZED_TO_PERFORM_THE_ACTION
        )
      );
  }

  auction.bidEnd = req.body.bidEnd;
  auction.bidStart = req.body.bidStart;
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
    SimpleLogger.error(err);

    return res.status(400).send(
      createResObject(false, {
        error: err,
      })
    );
  }
};

const remove = async (req, res) => {
  let currentDate = new Date();

  try {
    let auction = await Auction.findById(req.params.auctionId);

    if (
      (auction.bidStart <= currentDate && currentDate <= auction.bidEnd) ||
      auction.bids.length > 0
    ) {
      return res
        .status("400")
        .send(
          createResObject(
            false,
            {},
            "Can't remove an auction after it is gone live or if someone placed a bid."
          )
        );
    }

    if (!auction)
      return res
        .status("400")
        .send(createResObject(false, {}, stringConstants.AUCTION_ID_NOT_FOUND));

    await auction.remove();
    await Listing.findByIdAndUpdate(auction.listing, {
      auctionId: null,
    });

    res.send(
      createResObject(true, { auction }, stringConstants.DELETED_SUCCESSFULLY)
    );
  } catch (err) {
    SimpleLogger.error(err);

    return res.status(400).send(createResObject(false, {}, err.message || err));
  }
};

const listOpen = async (_req, res) => {
  try {
    let auctions = await Auction.find({ bidEnd: { $gt: new Date() } })
      .sort("bidStart")
      .select("bids bidEnd bidStart startingBid")
      .populate(
        "listing",
        "images playerNames title is_sale sale_price price _id"
      );
    res.send(
      createResObject(true, { auctions }, "Fetched open auctions successfully")
    );
  } catch (err) {
    SimpleLogger.error(err);

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
  try {
    let auctions = await Auction.find({ seller: req.user._id }).populate(
      "listing",
      "images playerNames title is_sale sale_price price _id"
    );
    res.send(
      createResObject(true, { auctions }, "Fetched auctions successfully")
    );
  } catch (err) {
    SimpleLogger.error(err);

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
    let auctions = await Auction.find({
      "bids.bidder": req.user._id,
    }).populate("listing", "images playerNames title _id");
    res.send(
      createResObject(true, { auctions }, "Fetched auctions successfully")
    );
  } catch (err) {
    SimpleLogger.error(err);

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
  auctionByIdDetailed,
};
