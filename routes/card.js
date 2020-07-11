const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authenticateRequest");
const SimpleLogger = require("../utils/simpleLogger");
const path = require("path");
const fsPromises = require("fs").promises;
const _ = require("lodash");
const { User } = require("../models/user");
const { Card } = require("../models/card");
const { PendingDeletion } = require("../models/pendingDeletion");
const { stringConstants } = require("../utils/constants");
const { errorObjects } = require("../utils/errorObjects");
const {
  uploadCardFront,
  uploadCardBack,
  uploadCardVideo,
} = require("../middlewares/multerSingle");
const { valObjectIdInUrl } = require("../middlewares/validation");

/**
 * Step 1: Create a new card and upload card front
 */
router("/add-front", auth, async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user)
    return res
      .status(404)
      .send(
        createResObject(
          false,
          {},
          stringConstants.USER_ID_DOEST_NOT_EXISTS,
          errorObjects.USER_ID_DOEST_NOT_EXISTS
        )
      );

  uploadCardFront(req, res, async function (err) {
    if (err) {
      SimpleLogger.error(err);
      // If file type error return relavent message
      if (err.message === stringConstants.NOT_A_VALID_FILE_TYPE) {
        return res
          .status(415)
          .send(
            createResObject(
              false,
              {},
              stringConstants.FILE_TYPE_NOT_ACCEPTED,
              errorObjects.FILE_TYPE_NOT_ACCEPTED
            )
          );
      }
      // Otherwise return unsuspected error
      return next(err);
    }

    // Check file exists
    if (!req.file)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.NO_FILE_FOUND,
            errorObjects.NO_FILE_FOUND
          )
        );
    // Check file size if corrupt delete the uploaded file
    if (req.file.size <= 0) {
      try {
        await fsPromises.unlink(
          path.join(__dirname, "../public/card_fronts/", `${req.file.filename}`)
        );
      } catch (err) {
        SimpleLogger.error(err);
        await new PendingDeletion({
          deletionType: stringConstants.deletionType.FILE,
          data: path.join(
            __dirname,
            "../public/card_fronts/",
            `${req.file.filename}`
          ),
        }).save();
      }
      return res
        .status(400)
        .send(
          createResObject(
            true,
            {},
            stringConstants.FILE_CORRUPTED,
            errorObjects.FILE_CORRUPTED
          )
        );
    }

    let card = new Card({
      front: path.join("card_fronts/", `${req.file.filename}`),
      user: user._id,
    });

    card = await card.save();
    card = _.pick(card, ["_id", "front", "user"]);

    return res.send(
      createResObject(true, { card }, stringConstants.UPDATE_SUCCESSFUL)
    );
  });
});

/**
 * Step 2: Add back of the card picture to an existing card
 * requires the card id in request
 */
router.post("/add-back/:cardId", [auth, valObjectIdInUrl], async (req, res) => {
  let card = await Card.findById(req.params.cardId);
  if (!card) {
    return res
      .status(404)
      .send(
        createResObject(
          false,
          {},
          stringConstants.CARD_ID_NOT_FOUND,
          errorObjects.CARD_ID_NOT_FOUND
        )
      );
  }

  const user = await User.findById(req.user._id);
  if (!user)
    return res
      .status(404)
      .send(
        createResObject(
          false,
          {},
          stringConstants.USER_ID_DOEST_NOT_EXISTS,
          errorObjects.USER_ID_DOEST_NOT_EXISTS
        )
      );

  // Upload the back of the card
  uploadCardBack(req, res, async function (err) {
    if (err) {
      SimpleLogger.error(err);
      // If file type error return relavent message
      if (err.message === stringConstants.NOT_A_VALID_FILE_TYPE) {
        return res
          .status(415)
          .send(
            createResObject(
              false,
              {},
              stringConstants.FILE_TYPE_NOT_ACCEPTED,
              errorObjects.FILE_TYPE_NOT_ACCEPTED
            )
          );
      }
      // Otherwise return unsuspected error
      return next(err);
    }

    // Check file exists
    if (!req.file)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.NO_FILE_FOUND,
            errorObjects.NO_FILE_FOUND
          )
        );
    // Check file size if corrupt delete the uploaded file
    if (req.file.size <= 0) {
      try {
        await fsPromises.unlink(
          path.join(__dirname, "../public/card_backs/", `${req.file.filename}`)
        );
      } catch (err) {
        SimpleLogger.error(err);
        await new PendingDeletion({
          deletionType: stringConstants.deletionType.FILE,
          data: path.join(
            __dirname,
            "../public/card_backs/",
            `${req.file.filename}`
          ),
        }).save();
      }
      return res
        .status(400)
        .send(
          createResObject(
            true,
            {},
            stringConstants.FILE_CORRUPTED,
            errorObjects.FILE_CORRUPTED
          )
        );
    }
    card.back = path.join("card_backs/", `${req.file.filename}`);
    card = await card.save();

    card = _.pick(card, ["_id", "front", "back", "user"]);

    return res.send(
      createResObject(true, { card }, stringConstants.UPDATE_SUCCESSFUL)
    );
  });
});

/**
 * Step 3: This is where the user will upload the video for the game card
 */
router.post(
  "/add-video/:cardId",
  [auth, valObjectIdInUrl],
  async (req, res) => {
    let card = await Card.findById(req.params.cardId);
    if (!card) {
      return res
        .status(404)
        .send(
          createResObject(
            false,
            {},
            stringConstants.CARD_ID_NOT_FOUND,
            errorObjects.CARD_ID_NOT_FOUND
          )
        );
    }

    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(404)
        .send(
          createResObject(
            false,
            {},
            stringConstants.USER_ID_DOEST_NOT_EXISTS,
            errorObjects.USER_ID_DOEST_NOT_EXISTS
          )
        );

    uploadCardVideo(req, res, async function (err) {
      if (err) {
        SimpleLogger.error(err);
        // If file type error return relavent message
        if (err.message === stringConstants.NOT_A_VALID_FILE_TYPE) {
          return res
            .status(415)
            .send(
              createResObject(
                false,
                {},
                stringConstants.FILE_TYPE_NOT_ACCEPTED,
                errorObjects.FILE_TYPE_NOT_ACCEPTED
              )
            );
        }
        // Otherwise return unsuspected error
        return next(err);
      }

      if (!req.file) {
        return res
          .status(400)
          .send(
            createResObject(
              false,
              {},
              stringConstants.NO_FILE_FOUND,
              errorObjects.NO_FILE_FOUND
            )
          );
      }

      if (req.file.size <= 0) {
        try {
          await fsPromises.unlink(
            path.join(
              __dirname,
              "../public/card_videos/",
              `${req.file.filename}`
            )
          );
        } catch (error) {
          SimpleLogger.error(error);
          SimpleLogger.error(err);
          await new PendingDeletion({
            deletionType: stringConstants.deletionType.FILE,
            data: path.join(
              __dirname,
              "../public/card_videos/",
              `${req.file.filename}`
            ),
          }).save();
        }
        return res
          .status(400)
          .send(
            createResObject(
              true,
              {},
              stringConstants.FILE_CORRUPTED,
              errorObjects.FILE_CORRUPTED
            )
          );
      }

      card.video = path.join("card_videos/", `${req.file.filename}`);
      card = await card.save();

      card = _.pick(card, ["_id", "front", "back", "video", "user"]);

      return res.send(
        createResObject(true, { card }, stringConstants.UPDATE_SUCCESSFUL)
      );
    });
  }
);
/**
 * Step 4: This is where user will remaining information of the card. The last step
 * to upload the card. Card isCompleted will turn to true but status will still
 * be pending. It will only change to submitted once we receive the payment
 */
router.post(
  "add-card-data/:cardId",
  [auth, valObjectIdInUrl],
  async (req, res) => {
    let card = await Card.findById(req.params.id);
    if (!card)
      return res
        .status(404)
        .send(
          createResObject(
            false,
            {},
            stringConstants.CARD_ID_NOT_FOUND,
            errorObjects.CARD_ID_NOT_FOUND
          )
        );

    const athleteName = req.body.athleteName;
    const cardName = req.body.cardName;
    const cardYear = req.body.cardYear;

    card.athleteName = athleteName;
    card.cardName = cardName;
    card.cardYear = cardYear;

    if (
      card.front &&
      card.back &&
      card.video &&
      card.athleteName &&
      card.cardName &&
      card.cardYear
    ) {
      card.isComplete = true;
    }

    card = await card.save();

    card = _.pick(card, [
      "_id",
      "front",
      "back",
      "video",
      "athleteName",
      "cardName",
      "cardYear",
      "user",
    ]);

    return res.send(
      createResObject(true, { card }, stringConstants.FETCH_SUCESSFUL)
    );
  }
);

/**
 * API endpoint to delete card with the card ID
 */

/**
 * API endpoint to get list of pending cards for user
 */
module.exports = router;
