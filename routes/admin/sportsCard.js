/**
 * All card related routes for admin such as:
 * 1. Grade submitted cards
 * 2. Submit grading for card
 */
const express = require("express");
const router = express.Router();
const admin = require("../../middlewares/authenticateAdmin");
const appAuth = require("../../middlewares/authenticateApp");
const { Card } = require("../../models/card");
const { User } = require("../../models/user");
const { Question } = require("../../models/question");
const { stringConstants } = require("../../utils/constants");
const { errorObjects } = require("../../utils/errorObjects");
const { createResObject } = require("../../utils/utilFunctions");
const { sendNotiToUser } = require("../../utils/sendNotifications");
const {
  valPageSizeNumber,
  valCardGradeReq,
} = require("../../middlewares/validation");

/**
 * Get all the cards that need to be graded
 * After payment has been submitted
 */
router.get(
  "/pending-grading-cards/:pageSize/:pageNumber",
  [appAuth, admin, valPageSizeNumber],
  async (req, res) => {
    const pageSize = parseInt(req.params.pageSize);
    const pageNumber = parseInt(req.params.pageNumber);

    let cards = await Card.find({
      status: stringConstants.cardState.SUBMITTED,
    }).lean();
    const numCards = cards.length;

    cards = await Card.find({ status: stringConstants.cardState.SUBMITTED })
      .sort({ createdAt: 1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);
    // Transform card object
    cards = cards.map((card) => {
      return card.getCardDetailsWithGrading();
    });

    return res.send(
      createResObject(
        true,
        { cards: cards, numCards },
        stringConstants.FETCH_SUCESSFUL
      )
    );
  }
);

/**
 * Post route for admin to post the rating of the card
 */
router.post(
  "/submit-grades",
  [appAuth, admin, valCardGradeReq],
  async (req, res) => {
    const cardId = req.body.cardId;

    let card = await Card.findOne({
      $and: [
        { _id: cardId },
        { status: stringConstants.cardState.SUBMITTED },
        { isCompleted: true },
      ],
    });
    if (!card)
      return res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.CARD_ID_NOT_FOUND,
            errorObjects.CARD_ID_NOT_FOUND
          )
        );

    const {
      signedCeleb,
      cornerValue,
      edgeValue,
      surfaceValue,
      eyeAppeal,
      centerFront,
      centerBack,
      cardStains,
      cardSleeving,
      printingDefects,
    } = req.body;

    const totalPointsScored =
      signedCeleb +
      cornerValue +
      edgeValue +
      surfaceValue +
      eyeAppeal +
      centerFront +
      centerBack +
      cardStains +
      cardSleeving +
      printingDefects;

    const questions = await Question.find({});

    let totalPoints = 0;

    for (const question of questions) {
      totalPoints += question.maxPoints;
    }

    let grade = (totalPointsScored / totalPoints) * 10;

    let gradDesc;

    if (grade >= 9.65 && grade <= 10) {
      gradDesc = stringConstants.gradeDesc.GEM_MT_10;
    } else if (grade >= 9 && grade < 9.65) {
      gradDesc = stringConstants.gradeDesc.MINT_9;
    } else if (grade >= 8 && grade < 9) {
      gradDesc = stringConstants.gradeDesc.NEAR_MINT_MINT;
    } else if (grade >= 7 && grade < 8) {
      gradDesc = stringConstants.gradeDesc.NEAR_MINT;
    } else if (grade >= 6 && grade < 7) {
      gradDesc = stringConstants.gradeDesc.EXCELLENT_MINT;
    } else if (grade >= 5 && grade < 6) {
      gradDesc = stringConstants.gradeDesc.EXCELLENT;
    } else if (grade >= 4 && grade < 5) {
      gradDesc = stringConstants.gradeDesc.VERY_GOOD_EXCELLENT;
    } else if (grade >= 3 && grade < 4) {
      gradDesc = stringConstants.gradeDesc.VERY_GOOD;
    } else if (grade >= 2 && grade < 3) {
      gradDesc = stringConstants.gradeDesc.GOOD;
    } else if (grade >= 1.5 && grade < 2) {
      gradDesc = stringConstants.gradeDesc.FAIR;
    } else if (grade < 1) {
      gradDesc = stringConstants.gradeDesc.POOR;
    } else {
      gradDesc = stringConstants.gradeDesc.UNGRADABLE;
    }

    grade = grade.toPrecision(3);

    card.cornerValue = cornerValue;
    card.centerFront = centerFront;

    const gradedCardPath = await createGradedImage(card, grade, gradDesc);

    card = await Card.findByIdAndUpdate(
      cardId,
      {
        $set: {
          gradedImage: gradedCardPath,
          status: stringConstants.cardState.GRADED,
          "grading.signedCeleb": signedCeleb,
          "grading.cornerValue": cornerValue,
          "grading.edgeValue": edgeValue,
          "grading.surfaceValue": surfaceValue,
          "grading.eyeAppeal": eyeAppeal,
          "grading.centerFront": centerFront,
          "grading.centerBack": centerBack,
          "grading.cardStains": cardStains,
          "grading.cardSleeving": cardSleeving,
          "grading.printingDefects": printingDefects,
          "grading.grade": grade,
          "grading.gradeDesc": gradDesc,
        },
      },
      { new: true }
    );

    const user = await User.findById(card.user);
    if (user) {
      // Send notification user
      sendNotiToUser(user, {
        title: "DCGS: Card has been graded",
        body: "Card has been graded",
        data: {},
      });
    }

    return res.send(
      createResObject(
        true,
        { card: card.getCardDetailsWithGrading() },
        stringConstants.UPDATE_SUCCESSFUL
      )
    );
  }
);

module.exports = router;
