const questionaireScript = require("../init/initQuestions");
const subscriptionScript = require("../init/initSubscription");

module.exports = async () => {
  await questionaireScript();
  await subscriptionScript();
};
