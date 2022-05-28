const { createResObject } = require("../../utils/utilFunctions");
const { collectionCardSortList } = require("../../services");

const changeIndexOfCardSortList = async (req, res) => {
  const response = await collectionCardSortList.changeIndexOfCardSortList(
    req.body.toIndex,
    req.params.cardId,
    req.user._id
  );
  if (response.isSuccess)
    res
      .status(response.status || 200)
      .send(createResObject(response.isSuccess, {}, response.message));
  else {
    res
      .status(response.status || 400)
      .send(
        createResObject(
          response.isSuccess,
          {},
          response.message,
          response.error || {}
        )
      );
  }
};

module.exports = {
  changeIndexOfCardSortList,
};
