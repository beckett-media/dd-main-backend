const { Auction } = require("../models/auction.model");
const authUser = require("../middlewares/socketAuthenticateUser");

const bidding = (server) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", function (socket) {
    socket.on("join auction room", (data) => {
      socket.join(data.room);
    });
    socket.on("leave auction room", (data) => {
      socket.leave(data.room);
    });
    socket.on("new bid", (data) => {
      bid(data.bidInfo, data.room);
    });
  });
  const bid = async (bid, auction) => {
    try {
      let auth = await authUser(bid.jwt);
      if (auth.status && auth?.user?.stripeId) {
        let result = await Auction.findOneAndUpdate(
          {
            _id: auction,
            seller: { $ne: auth.user._id },
            $or: [
              { "bids.0.bidAmount": { $lt: bid.bidAmount } },
              { bids: { $eq: [] } },
            ],
          },
          {
            $push: {
              bids: {
                $each: [
                  {
                    bidAmount: bid.bidAmount,
                    bidder: auth.user._id,
                    time: new Date(),
                  },
                ],
                $position: 0,
              },
            },
          },
          { new: true }
        )
          .populate("seller", "_id fullName")
          .populate(
            "listing",
            "images playerNames title is_sale sale_price price _id "
          )
          .exec();

        if (result) {
          io.to(auction).emit("new bid", {
            success: true,
            data: { ...result, bidder: auth.user._id },
            message: "Bid placed successfully",
          });
        } else {
          io.to(auction).emit("new bid", {
            success: false,
            data: { bidder: auth.user._id },
            message: "Not able to place your bid",
          });
        }
      } else {
        io.to(auction).emit("new bid", {
          success: false,
          data: { bidder: auth.user._id },
          message: auth.message,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };
};

module.exports = {
  bidding,
};
