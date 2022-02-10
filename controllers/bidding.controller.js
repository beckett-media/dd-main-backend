const { Auction } = require("../models/auction.model");
const authUser = require("../middlewares/socketAuthenticateUser");
const bidding = (server) => {
  const io = require("socket.io").listen(server);

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
      if (auth.status) {
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
          .populate("bids.bidder", "_id fullName")
          .populate("seller", "_id fullName")
          .exec();

        if (result) {
          io.to(auction).emit("new bid", {
            success: true,
            data: { ...result },
            message: "Bid placed successfully",
          });
        } else {
          io.to(auction).emit("new bid", {
            success: false,
            data: {},
            message: "Not able to place your bid",
          });
        }
      } else {
        io.to(auction).emit("new bid", {
          success: false,
          data: {},
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
