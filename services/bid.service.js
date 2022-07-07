const sendMail = require("../handler/sendMail");
const { User } = require("../models/user");

async function checkAndSendEmail(result, user) {
  if (result._doc.bids.length === 0) {
    await sendMail({
      email: user.biddingEmail || user.email,
      subject: "Your Bid Is Placed",
      text: `Send email to only this bidder as first bid is placed`,
    });
    //send email to only this bidder as first bid is placed
  } else if (
    result._doc.bids[0].bidder._id.toString() === user._id.toString()
  ) {
    //send email to bid placer that you are winning
    await sendMail({
      email: user.biddingEmail || user.email,
      subject: "Your bid is placed",
      text: " Chances of your win are strong as you bid top of your own bid",
    });
  } else {
    const lostBidder = await User.findById(result._doc.bids[0].bidder);

    //send email to bidder
    await sendMail({
      email: user.biddingEmail || user.email,
      subject: "Your Bid is Placed",
      text: "New Bid Placed, Wait until new bid placed or auction to end",
    });
    //send email to looser
    await sendMail({
      email: lostBidder.biddingEmail || lostBidder.email,
      subject: "Your Bid is down",
      text: "New Bid Placed on your bid, to win auction place a new bid with higher price",
    });
  }
}

module.exports = {
  checkAndSendEmail,
};
