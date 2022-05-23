const { createResObject } = require("../../utils/utilFunctions");
const { gradedCardSortList } = require("../../services/");
const { errorObjects } = require("../../utils/errorObjects");

const changeIndexOfCardSortList = async (req, res) => {
  const response = await gradedCardSortList.changeIndexOfCardSortList(
    req.body.toIndex,
    req.params.cardId,
    req.body.gradedListId,
    req.user._id
  );
  if (response.isSuccess)
    res.status(response.status || 200).send(
      createResObject(
        response.isSuccess,
        {
          updatedGradedSortedList: response.updatedGradedSortedList
        },
        response.message
      )
    );
  else {
    res
      .status(response.status || 400)
      .send(
        createResObject(
          response.isSuccess,
          {},
          response.message,
          errorObjects.PROMO_CODE_ALREADY_EXISTS
        )
      );
  }
};

module.exports = {
  changeIndexOfCardSortList,
};
