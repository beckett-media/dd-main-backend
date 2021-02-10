const { Subscription } = require("../models/subscription");
const SimpleLogger = require("../utils/simpleLogger");

const getDetail = (val) => `This plan gives you access to ${val} due dilly per month, which means you get access quality assessments of ${val} cards per month`;

const initValue = {
    _id: "subscription",
    plans: [
      { _id: "sub_low", price: "2.99", detail: getDetail('10'), duration: 'month', cards: 10, cardsInPlan: 10 },
      { _id: "sub_med", price: "3.99", detail: getDetail('20'), duration: 'month', cards: 20, cardsInPlan: 20 },
      { _id: "sub_high", price: "9.99", detail: getDetail('unlimited'), duration: 'month', cards: 1000, cardsInPlan: 'Unlimited' }
    ]
};

module.exports = async () => {
  try {
    const savedSubscription = await Subscription.find({}).lean();
    if (!savedSubscription.length) {
        let s = new Subscription({...initValue});
        s = await s.save();
    }
  } catch (error) {
    SimpleLogger.error(error, true);
  }
};
