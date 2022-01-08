const Jimp = require("jimp");
const path = require("path");
const fs = require("fs");
const QRCode = require("qrcode");
const config = require("config");
const { stringConstants } = require("../utils/constants");
const upload = require('./../s3/upload');

async function createGradedImage(card, newApp = false) {
  try {
    const cardId = card._id;
    const userId = card.user;
    // Create the overlay image
    const cardImagePath = newApp ? card.front : path.join(__dirname, "../public", card.front);
    let cardImage = await Jimp.read(cardImagePath);

    cardImage.cover(500, 700);

    let cardWidth = cardImage.getWidth();
    let cardHeight = cardImage.getHeight();

    const blackBgPath = path.join(
      __dirname,
      "../assets/card_overlay",
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
      "../assets/card_overlay",
      stringConstants.imageAssetNames.DCGS_LOGO
    );

    const tickImagePath = path.join(
      __dirname,
      "../assets/card_overlay",
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
      `../assets/card_overlay/${cardId}_qr_code.png`
    );
    const qrBaseUrl = config.get(stringConstants.URLS.qrBaseUrl);
    await QRCode.toFile(qrCodeImagePath, `${qrBaseUrl}${userId}/cards/${cardId}/graded_card.png`, {
      color: {
        dark: '#fff',
        light: '#0000' // Transparent background
      }
    });

    const qrCodeImage = await Jimp.read(qrCodeImagePath);
    // qrCodeImage.resize(154, 154);

    const qrCodeMaskPath = path.join(
      __dirname,
      "../assets/card_overlay",
      stringConstants.imageAssetNames.QR_CODE_MASK
    );
    const qrCodeMask = await Jimp.read(qrCodeMaskPath);
    qrCodeMask.resize(logoQrWidth, logoQrHeight);
    qrCodeImage.mask(qrCodeMask, 0, 0);

    const qrPositionX = 90;
    const qrPositionY = bgHeight - 250 + 10;

    blackBg.composite(qrCodeImage, cardWidth - qrPositionX - 80, qrPositionY - 20);

    const anton16WhitePath = path.join(
      __dirname,
      "../assets/fonts/poppins/24/Poppins.ttf.fnt"
    );

    const anton32WhitePath = path.join(
      __dirname,
      "../assets/fonts/poppins/32/Poppins.ttf.fnt"
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
      "../assets/fonts/poppins/36/Poppins.ttf.fnt"
    );
    // Score of top right corner
    font = await Jimp.loadFont(anton36WhitePath);

    font = await Jimp.loadFont(anton16WhitePath);

    // Bottom text
    const anton24WhitePath = path.join(
      __dirname,
      "../assets/fonts/poppins/28/Poppins.ttf.fnt"
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

    const secondsSinceEpoch = Date.now();
    const destinationPath = `${card.user}/cards/${card._id}/graded_card_${secondsSinceEpoch}.png`;
    // Delete the QR image
    fs.unlinkSync(qrCodeImagePath);
    // Upload the image to s3
    const buffer = await blackBg.getBufferAsync(Jimp.AUTO);
    const response = await upload(destinationPath, 'cardOverlay', buffer, 'png');
    const { Location: gradedCardPath = '' } = response;
    // Return the relative path
    return gradedCardPath;
  } catch (error) {
    throw error;
  }
}

function textYPosition(lineNumber, linePadTop, lineHeight) {
    return lineNumber * linePadTop + lineHeight * (lineNumber - 1);
}

module.exports = createGradedImage;
