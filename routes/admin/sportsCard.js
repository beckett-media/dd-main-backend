/**
 * All card related routes for admin such as:
 * 1. Grade submitted cards
 * 2. Submit grading for card
 */
const express = require("express");
const router = express.Router();
const admin = require("../../middlewares/authenticateAdmin");
const appAuth = require("../../middlewares/authenticateApp");
const Jimp = require("jimp");
const path = require("path");
const fs = require("fs");
const QRCode = require("qrcode");
const { Card } = require("../../models/card");
const { User } = require("../../models/user");
const { Question } = require("../../models/question");
const { stringConstants } = require("../../utils/constants");
const { errorObjects } = require("../../utils/errorObjects");
const { createResObject, isNumber } = require("../../utils/utilFunctions");
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

    const gradedCardPath = await createGradedImage(card);

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
      createResObject(true, { card }, stringConstants.UPDATE_SUCCESSFUL)
    );
  }
);

async function createGradedImage(card) {
  try {
    const cardId = card._id;
    // Create the overlay image
    const cardImagePath = path.join(__dirname, "../../public", card.front);
    let cardImage = await Jimp.read(cardImagePath);

    cardImage.scaleToFit(500, 700);

    const innerImageMaskPath = path.join(
      __dirname,
      "../../assets/card_overlay",
      stringConstants.imageAssetNames.INNER_IMAGE_MASK
    );
    const innerImageMask = await Jimp.read(innerImageMaskPath);
    innerImageMask.resize(cardImage.getWidth(), cardImage.getHeight());

    cardImage.mask(innerImageMask, 0, 0);

    let cardWidth = cardImage.getWidth();
    let cardHeight = cardImage.getHeight();

    const blackBgPath = path.join(
      __dirname,
      "../../assets/card_overlay",
      stringConstants.imageAssetNames.OUTER_IMAGE_MASK
    );
    const blackBg = await Jimp.read(blackBgPath);

    const overlayPadVert = 300;
    const overlayPadHorz = 100;

    blackBg.resize(cardWidth + overlayPadHorz, cardHeight + overlayPadVert);

    let bgWidth = blackBg.getWidth();
    let bgHeight = blackBg.getHeight();

    blackBg.composite(cardImage, overlayPadHorz / 2, overlayPadVert / 2);

    const logoImagePath = path.join(
      __dirname,
      "../../assets/card_overlay",
      stringConstants.imageAssetNames.DCGS_LOGO
    );
    const logoImage = await Jimp.read(logoImagePath);

    const logoQrWidth = 125;
    const logoQrHeight = 125;

    logoImage.resize(logoQrWidth, logoQrHeight);

    blackBg.composite(logoImage, 0, 0);

    // QR Code
    const qrCodeImagePath = path.join(
      __dirname,
      `../../assets/card_overlay/${cardId}_qr_code.png`
    );
    await QRCode.toFile(qrCodeImagePath, "test");

    const qrCodeImage = await Jimp.read(qrCodeImagePath);
    qrCodeImage.resize(logoQrWidth, logoQrHeight);

    const qrCodeMaskPath = path.join(
      __dirname,
      "../../assets/card_overlay",
      stringConstants.imageAssetNames.QR_CODE_MASK
    );
    const qrCodeMask = await Jimp.read(qrCodeMaskPath);
    qrCodeMask.resize(logoQrWidth, logoQrHeight);
    qrCodeImage.mask(qrCodeMask, 0, 0);

    const qrPositionX = 60;
    const qrPositionY = bgHeight - 150 + 10;

    blackBg.composite(qrCodeImage, qrPositionX, qrPositionY);

    const anton16WhitePath = path.join(
      __dirname,
      "../../assets/fonts/white/anton16/anton.fnt"
    );

    let linePadTop = 2;
    let linePadLeft = 10;
    let font = await Jimp.loadFont(anton16WhitePath);
    // First line
    blackBg.print(font, logoQrWidth + linePadLeft, linePadTop, "First Line");
    const lineHeight = Jimp.measureTextHeight(font, "First Line");
    // Second line
    blackBg.print(
      font,
      logoQrWidth + linePadLeft,
      linePadTop + lineHeight + linePadTop,
      "Second Line"
    );
    // const line2H = Jimp.measureTextHeight(font, "Second Line");
    // Third line
    blackBg.print(
      font,
      logoQrWidth + linePadLeft,
      linePadTop + lineHeight + linePadTop + lineHeight + linePadTop,
      "Third Line"
    );
    // Fourth line
    blackBg.print(
      font,
      logoQrWidth + linePadLeft,
      textYPosition(4, linePadTop, lineHeight),
      "Fourth line"
    );
    // Fifth line
    blackBg.print(
      font,
      logoQrWidth + linePadLeft,
      textYPosition(5, linePadTop, lineHeight) + 5,
      "Centering Point And Cornering Point"
    );

    const anton36WhitePath = path.join(
      __dirname,
      "../../assets/fonts/white/anton36/anton.fnt"
    );
    // Score of top right corner
    font = await Jimp.loadFont(anton36WhitePath);
    const scoreWidth = Jimp.measureText(font, "8.5");
    const scoreHeight = Jimp.measureText(font, "8.5");
    blackBg.print(font, bgWidth - scoreWidth - 20, 10, "8.5");
    font = await Jimp.loadFont(anton16WhitePath);
    blackBg.print(font, bgWidth - scoreWidth - 20, scoreHeight + 10, "Mint");

    // Bottom text
    const anton24WhitePath = path.join(
      __dirname,
      "../../assets/fonts/white/anton24/anton.fnt"
    );
    linePadTop = 10;
    font = await Jimp.loadFont(anton24WhitePath);
    blackBg.print(
      font,
      qrPositionX + logoQrWidth + 10,
      qrPositionY + linePadTop + 10,
      "#223143"
    );
    blackBg.print(
      font,
      qrPositionX + logoQrWidth + 10,
      qrPositionY + linePadTop + 10 + lineHeight + 10,
      "Scan to verify"
    );
    font = await Jimp.loadFont(anton24WhitePath);
    blackBg.print(
      font,
      qrPositionX + logoQrWidth + 10,
      qrPositionY + linePadTop + 10 + lineHeight + 10 + lineHeight + 10,
      "Digitally Graded @ "
    );
    const textWidth = Jimp.measureText(font, "Digitally Graded @ ");
    const anton24GreenPath = path.join(
      __dirname,
      "../../assets/fonts/green/anton24/anton.fnt"
    );
    font = await Jimp.loadFont(anton24GreenPath);
    blackBg.print(
      font,
      qrPositionX + logoQrWidth + 10 + textWidth,
      qrPositionY + linePadTop + 10 + lineHeight + 10 + lineHeight + 10,
      "DCGS.AI"
    );

    const destinationPath = path.join(
      __dirname,
      `../../public/${card.user}/cards/${card._id}/graded_card.png`
    );
    // Delete the QR image
    fs.unlinkSync(qrCodeImagePath);
    // Write the image to user card folder
    await blackBg.write(destinationPath);
    // Return the relative path
    const gradedCardPath = `${card.user}/cards/${card._id}/graded_card.png`;
    return gradedCardPath;
  } catch (error) {
    throw error;
  }
}

function textYPosition(lineNumber, linePadTop, lineHeight) {
  return lineNumber * linePadTop + lineHeight * (lineNumber - 1);
}

module.exports = router;
