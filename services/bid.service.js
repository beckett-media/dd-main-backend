const sendMail = require("../handler/sendMail");
const { User } = require("../models/user");

async function checkAndSendEmail(result, user) {
  if (result._doc.bids.length === 0) {
    sendMail({
      email,
      subject: "Your Bid Is Placed",
      text: `Send email to only this bidder as first bid is placed`,
    }).then(({ _success }) => {});
    //send email to only this bidder as first bid is placed
    console.log("");
  } else if (result._doc.bids[0].bidder.toString() === user._id.toString()) {
    const lostBidder = await User.findById(result._doc.bids[0].bidder);

    //send email to bid placer that you are winning
    console.log(
      "send email to bid placer that you are winning and chances are strong as you bid top of your own bid"
    );
  } else {
    //send email to bidder
    console.log("send email to bidder");
    //send email to looser
    console.log("send email to looser");
  }
}

module.exports = {
  checkAndSendEmail,
};
