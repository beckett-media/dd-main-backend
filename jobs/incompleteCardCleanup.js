/**
 * The job will cleanup all card that are older than a day
 * and are incomplete, which can happen when user closes
 * the app when submitting cards
 */
const { stringConstants } = require("../utils/constants");
const { Card } = require("../models/card");
const SimpleLogger = require("../utils/simpleLogger");

module.exports = async () => {
  SimpleLogger.info(
    `Starting Job: ${stringConstants.jobType.INCOMPLETE_CARD_CLEANUP}`
  );
  let thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - 2);

  const cards = await Card.find({
    $and: [
      { isCompleted: false },
      { updatedAt: { $lt: thresholdDate } },
      { status: stringConstants.cardState.PENDING },
    ],
  });

  //   Try catch is inside the for loop to continue iteration if there was an error
  for (const card of cards) {
    try {
      await card.remove();
    } catch (error) {
      SimpleLogger.error(
        `${stringConstants.jobType.INCOMPLETE_CARD_CLEANUP} Error: ${error.message}`
      );
    }
  }
  SimpleLogger.info(
    `Finished Job: ${stringConstants.jobType.INCOMPLETE_CARD_CLEANUP}`
  );
};
