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
const config = require("config");
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
    let card = await Card.findById(cardId);

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

async function createGradedImage(card) {
  try {
    const cardId = card._id;
    const userId = card.user;
    // Create the overlay image
    const cardImagePath = path.join(__dirname, "../../public", card.front);
    let cardImage = await Jimp.read(cardImagePath);

    cardImage.scaleToFit(500, 700);

    let cardWidth = cardImage.getWidth();
    let cardHeight = cardImage.getHeight();

    const blackBgPath = path.join(
      __dirname,
      "../../assets/card_overlay",
      stringConstants.imageAssetNames.OUTER_IMAGE_MASK
    );
    const blackBg = await Jimp.read(blackBgPath);

    const overlayPadVert = 550;
    const overlayPadHorz = 60;

    blackBg.resize(cardWidth + overlayPadHorz, cardHeight + overlayPadVert);

    let bgHeight = blackBg.getHeight();

    blackBg.composite(cardImage, overlayPadHorz / 2, overlayPadVert / 2);

    const logoImagePath = path.join(
      __dirname,
      "../../assets/card_overlay",
      stringConstants.imageAssetNames.DCGS_LOGO
    );

    const tickImagePath = path.join(
      __dirname,
      "../../assets/card_overlay",
      stringConstants.imageAssetNames.TICK
    );

    const logoImage = await Jimp.read(logoImagePath);
    const tickImage = await Jimp.read(tickImagePath);

    const logoQrWidth = 100;
    const logoQrHeight = 140;

    logoImage.resize(logoQrWidth, logoQrHeight);
    tickImage.resize(40, 40);

    blackBg.composite(logoImage, cardWidth - 90, 115);
    blackBg.composite(tickImage, cardWidth - 440, 67);

    // QR Code
    const qrCodeImagePath = path.join(
      __dirname,
      `../../assets/card_overlay/${cardId}_qr_code.png`
    );
    const qrBaseUrl = config.get(stringConstants.URLS.qrBaseUrl);
    await QRCode.toFile(qrCodeImagePath, `${qrBaseUrl}${userId}/cards/${cardId}/graded_card.png`, {
      color: {
        dark: '#fff',
        light: '#0000' // Transparent background
      }
    });

    const qrCodeImage = await Jimp.read(qrCodeImagePath);
    qrCodeImage.resize(logoQrWidth + 30, logoQrHeight + 10);

    const qrCodeMaskPath = path.join(
      __dirname,
      "../../assets/card_overlay",
      stringConstants.imageAssetNames.QR_CODE_MASK
    );
    const qrCodeMask = await Jimp.read(qrCodeMaskPath);
    qrCodeMask.resize(logoQrWidth, logoQrHeight);
    qrCodeImage.mask(qrCodeMask, 0, 0);

    const qrPositionX = 75;
    const qrPositionY = bgHeight - 250 + 10;

    blackBg.composite(qrCodeImage, cardWidth - qrPositionX - 30, qrPositionY + 10);

    const anton16WhitePath = path.join(
      __dirname,
      "../../assets/fonts/white/anton24/anton.fnt"
    );

    const anton32WhitePath = path.join(
      __dirname,
      "../../assets/fonts/white/anton32/anton.fnt"
    );

    let linePadTop = 10;
    let font = await Jimp.loadFont(anton32WhitePath);
    // Zeroth line: Year
    const zeroLine = 'ASSESSED BY DUEDILLY.CO';
    const baseWidth = qrPositionX - 10;
    const baseHeight = cardWidth - 435;
    blackBg.print(font, baseWidth + 50, baseHeight, zeroLine);
    const lineHeight = Jimp.measureTextHeight(font, zeroLine);
    // First line: Year
    const firstLine = card.year ? card.year.toString() : '';
    font = await Jimp.loadFont(anton16WhitePath);
    blackBg.print(font, baseWidth, baseHeight + lineHeight + linePadTop, firstLine);
    // Second line: Brand
    const secondLine = card.playerNames.join(", ") || '';
    blackBg.print(
      font,
      baseWidth,
      2 * lineHeight + baseHeight + 5,
      secondLine
    );
    // Third line: Card number
    const thirdLine = card.brand ? card.brand : '';

    blackBg.print(
      font,
      baseWidth,
      3 * lineHeight + baseHeight,
      thirdLine
    );
    // Fourth line: Player names
    // const fourthLine = `Corners ${card.cornerValue}`;
    // blackBg.print(
    //   font,
    //   baseWidth,
    //   textYPosition(4, linePadTop, lineHeight) + 5,
    //   fourthLine
    // );
    // const fifthLine = `Center ${card.centerFront}`;
    // blackBg.print(
    //   font,
    //   baseWidth,
    //   textYPosition(5, linePadTop, lineHeight) + 5,
    //   fifthLine
    // );

    const anton36WhitePath = path.join(
      __dirname,
      "../../assets/fonts/white/anton36/anton.fnt"
    );
    // Score of top right corner
    font = await Jimp.loadFont(anton36WhitePath);

    font = await Jimp.loadFont(anton16WhitePath);

    // Bottom text
    const anton24WhitePath = path.join(
      __dirname,
      "../../assets/fonts/white/anton28/anton.fnt"
    );
    linePadTop = 10;
    font = await Jimp.loadFont(anton24WhitePath);
    const serialNumber = `# ${Math.floor(Math.pow(10, 8-1) + Math.random() * 9 * Math.pow(10, 8-1))}`; // TODO: serial number
    blackBg.print(
      font,
      qrPositionX - 10,
      qrPositionY,
      serialNumber
    );
    font = await Jimp.loadFont(anton32WhitePath);
    blackBg.print(
      font,
      qrPositionX - 10,
      qrPositionY + lineHeight + 10,
      "Scan to Verify"
    );
    blackBg.print(
      font,
      qrPositionX - 10,
      qrPositionY + lineHeight + 10 + lineHeight + 10,
      "Assessment"
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
