const Collection = require("../../models/collection");
const {
  CollectionCardSortList,
} = require("../../models/dragDropSort/collection-cards-sort-list");
const { errorObjects } = require("../../utils/errorObjects");

const { stringConstants } = require("../../utils/constants");

const getUserCollectionCardsList = (userId) => {
  return CollectionCardSortList.findOne({ user: userId });
};

const changeIndexOfCardSortList = async (toIndex, cardId, userId) => {
  let collectionCardsSortedList = await CollectionCardSortList.findOne({
    user: userId,
  });

  if (!collectionCardsSortedList) {
    collectionCardsSortedList = await createUserListForCollectionCards(userId);
  }

  if (toIndex >= collectionCardsSortedList.cards.length) {
    return {
      isSuccess: false,
      status: 400,
      message: stringConstants.TO_INDEX_OVERFLOW,
      error: errorObjects.TO_INDEX_OVERFLOW,
    };
  }

  const fromIndex = collectionCardsSortedList.cards.indexOf(cardId);
  if (fromIndex !== -1) {
    collectionCardsSortedList.cards.splice(fromIndex, 1);
    collectionCardsSortedList.cards.splice(toIndex, 0, cardId);
    const updatedCollectionSortedList = await collectionCardsSortedList.save();

    return {
      isSuccess: true,
      status: 200,
      message: `Collection card successfully moved from ${fromIndex} index to ${toIndex} index.`,
      updatedCollectionSortedList: {
        cards: updatedCollectionSortedList.cards,
        _id: updatedCollectionSortedList._id,
      },
    };
  } else {
    return {
      isSuccess: false,
      status: 404,
      message: stringConstants.CARD_ID_NOT_FOUND_COLLECTION_LIST,
      error: errorObjects.CARD_ID_NOT_FOUND_COLLECTION_LIST,
    };
  }
};

const getOrCreateAndGetUserCollectionSortedList = async (
  userId,
  pageSize,
  pageNumber
) => {
  let collectionList = await CollectionCardSortList.findOne({
    user: userId,
  }).select("cards");

  if (collectionList) {
    return {
      collectionList,
      cardsToFetch: collectionList.cards.slice(
        (pageNumber - 1) * pageSize,
        (pageNumber - 1) * pageSize + pageSize
      ),
    };
  }
  collectionList = await createUserListForCollectionCards(userId);
  return {
    collectionList,
    cardsToFetch: collectionList.cards.slice(
      (pageNumber - 1) * pageSize,
      (pageNumber - 1) * pageSize + pageSize
    ),
  };
};

const createUserListForCollectionCards = async (userId) => {
  const collections = await Collection.Collection.find({
    user: userId,
  })
    .select("card")
    .sort({ createdAt: -1 });

    console.log(collections);

  let cardsId = collections.map((collection) => collection.card);

  const userCollectionCardList = await CollectionCardSortList.create({
    user: userId,
    cards: cardsId,
  });

  return userCollectionCardList;
};

const removeCardFromCollectionSortedList = async (cardId, userId) => {
  console.log(cardId);
  console.log(userId);
  const collectionCardsList = await getUserCollectionCardsList(userId);
  if (collectionCardsList) {
    const indexOfCard = collectionCardsList.cards.indexOf(cardId);
    if (indexOfCard >= 0) {
      collectionCardsList.cards.splice(indexOfCard, 1);
      await collectionCardsList.save();
      return true;
    }
  }
};

const addCardInCollectionSortedList = async ({ card: cardId, user: userId }) => {
  const collectionCardsList = await getUserCollectionCardsList(userId);
  if (collectionCardsList) {
    const indexOfCard = collectionCardsList.cards.indexOf(cardId);
    if (indexOfCard === -1) {
      collectionCardsList.cards.unshift(cardId);
      await collectionCardsList.save();
    }
  } else {
    const collectionList = await createUserListForCollectionCards(userId);
    const indexOfCard = collectionList.cards.indexOf(cardId);
    if (indexOfCard === -1) {
      collectionList.cards.unshift(cardId);
      await collectionList.save();
    }
  }
};

module.exports = {
  changeIndexOfCardSortList,
  createUserListForCollectionCards,
  getOrCreateAndGetUserCollectionSortedList,
  removeCardFromCollectionSortedList,
  addCardInCollectionSortedList,
};
