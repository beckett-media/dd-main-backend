const {
  GradedCardSortList,
} = require("../../models/dragDropSort/graded-cards-sort-list");
const { Card } = require("../../models/card");

const SimpleLogger = require("../../utils/simpleLogger");
const { stringConstants } = require("../../utils/constants");

const changeIndexOfCardSortList = async (
  toIndex,
  cardId,
  gradedListId,
  userId
) => {
  let gradedCardsSortedList = await GradedCardSortList.findById(gradedListId);

  if (!gradedCardsSortedList) {
    gradedCardsSortedList = await GradedCardSortList.findOne({
      user: userId,
    });

    if (!gradedCardsSortedList) {
      await createUserListForGradedCards(userId);
      return {
        isSuccess: false,
        status: 404,
        message:
          "Sorted Id for this user was not existed. Its created now. Try again.",
      };
    } else {
      return {
        isSuccess: false,
        status: 200,
        message: "You are providing wrong graded sorted list id",
      };
    }
  }

  if (toIndex >= gradedCardsSortedList.cards.length) {
    return {
      isSuccess: false,
      status: 400,
      message:
        "toIndex is greater than user graded list size. Array starts from 0 index",
    };
  }

  const fromIndex = gradedCardsSortedList.cards.indexOf(cardId);
  if (fromIndex !== -1) {
    gradedCardsSortedList.cards.splice(fromIndex, 1);
    gradedCardsSortedList.cards.splice(toIndex, 0, cardId);
    const updatedGradedSortedList = await gradedCardsSortedList.save();

    return {
      isSuccess: true,
      status: 200,
      message: `Card successfully moved from ${fromIndex} index to ${toIndex} index.`,
      updatedGradedSortedList: {
        cards: updatedGradedSortedList.cards,
        _id: updatedGradedSortedList._id,
      },
    };
  } else {
    return {
      isSuccess: false,
      status: 404,
      message: "CardId not found in user graded sorted list.",
    };
  }
};

const getOrCreateAndGetUserGradedSortedList = async (
  userId,
  pageSize,
  pageNumber
) => {
  let gradedList = await GradedCardSortList.findOne({ user: userId }).select(
    "cards"
  );

  if (gradedList) {
    return {
      gradedList,
      cardsToFetch: gradedList.cards.slice(
        (pageNumber - 1) * pageSize,
        (pageNumber - 1) * pageSize + pageSize
      ),
    };
  }
  gradedList = await createUserListForGradedCards(userId);
  return {
    gradedList,
    cardsToFetch: gradedList.cards.slice(
      (pageNumber - 1) * pageSize,
      (pageNumber - 1) * pageSize + pageSize
    ),
  };
};

const createUserListForGradedCards = async (userId) => {
  const cards = await Card.find({
    $and: [
      { user: userId },
      { status: stringConstants.cardState.GRADED },
      { isCompleted: true },
    ],
  })
    .select("_id")
    .sort({ createdAt: 1 });

  const userGradedCardList = await GradedCardSortList.create({
    user: userId,
    cards,
  });
  return userGradedCardList;
};

module.exports = {
  changeIndexOfCardSortList,
  createUserListForGradedCards,
  getOrCreateAndGetUserGradedSortedList,
};
