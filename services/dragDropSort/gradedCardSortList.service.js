const CardModel = require("../../models/card");
const {
  GradedCardSortList,
} = require("../../models/dragDropSort/graded-cards-sort-list");
const { errorObjects } = require("../../utils/errorObjects");

const { stringConstants } = require("../../utils/constants");

const getUserGradedCardsList = (userId) => {
  return GradedCardSortList.findOne({ user: userId });
};

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
          "Sorted List for this user was not existed. It's created now. Try again.",
      };
    } else {
      return {
        isSuccess: false,
        status: 404,
        message: stringConstants.GRADED_SORTED_ID_NOT_FOUND,
        error: errorObjects.GRADED_SORTED_ID_NOT_FOUND,
      };
    }
  }

  if (toIndex >= gradedCardsSortedList.cards.length) {
    return {
      isSuccess: false,
      status: 400,
      message: stringConstants.TO_INDEX_OVERFLOW,
      error: errorObjects.TO_INDEX_OVERFLOW,
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
      message: stringConstants.CARD_ID_NOT_FOUND_GRADED_LIST,
      error: errorObjects.CARD_ID_NOT_FOUND_GRADED_LIST,
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
  const cards = await CardModel.Card.find({
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

const removeCardFromGradedSortedList = async (cardId, userId) => {
  const gradedCardsList = await getUserGradedCardsList(userId);

  if (gradedCardsList) {
    const indexOfCard = gradedCardsList.cards.indexOf(cardId);

    if (indexOfCard >= 0) {
      gradedCardsList.cards.splice(indexOfCard, 1);
      await gradedCardsList.save();
      return true;
    }
  }
};

const addCardInGradedSortedList = async ({ cardId, userId }) => {
  const gradedCardsList = await getUserGradedCardsList(userId);

  if (gradedCardsList) {
    const indexOfCard = gradedCardsList.cards.indexOf(cardId);
    if (indexOfCard === -1) {
      gradedCardsList.cards.push(cardId);
      await gradedCardsList.save();
    }
  } else {
    const gradedList = await createUserListForGradedCards(userId);
    gradedList.cards.push(cardId);
    await gradedList.save();
  }
  return true;
};

module.exports = {
  changeIndexOfCardSortList,
  createUserListForGradedCards,
  getOrCreateAndGetUserGradedSortedList,
  removeCardFromGradedSortedList,
  addCardInGradedSortedList,
};
