const Jimp = require("jimp");
const path = require("path");
const fs = require("fs");
const QRCode = require("qrcode");
const config = require("config");

async function createGradedImage(card, grade, gradDesc) {
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
        const qrBaseUrl = config.get(stringConstants.URLS.qrBaseUrl);
        await QRCode.toFile(qrCodeImagePath, `${qrBaseUrl}${cardId}`);

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
        // First line: Year
        const firstLine = card.year.toString();
        blackBg.print(font, logoQrWidth + linePadLeft, linePadTop, firstLine);
        const lineHeight = Jimp.measureTextHeight(font, firstLine);
        // Second line: Brand
        const secondLine = card.brand;
        blackBg.print(
            font,
            logoQrWidth + linePadLeft,
            linePadTop + lineHeight + linePadTop,
            secondLine
        );
        // const line2H = Jimp.measureTextHeight(font, "Second Line");
        // Third line: Card number
        const thirdLine = card.cardNumber.toString();

        blackBg.print(
            font,
            logoQrWidth + linePadLeft,
            linePadTop + lineHeight + linePadTop + lineHeight + linePadTop,
            thirdLine
        );
        // Fourth line: Player names
        const fourthLine = card.playerNames.join(", ");
        blackBg.print(
            font,
            logoQrWidth + linePadLeft,
            textYPosition(4, linePadTop, lineHeight),
            fourthLine
        );
        // Fifth line: Centering and corners
        const fifthLine = `Centering ${card.centerFront}  Corner ${card.cornerValue}`;
        blackBg.print(
            font,
            logoQrWidth + linePadLeft,
            textYPosition(5, linePadTop, lineHeight) + 5,
            fifthLine
        );

        const anton36WhitePath = path.join(
            __dirname,
            "../../assets/fonts/white/anton36/anton.fnt"
        );
        // Score of top right corner
        font = await Jimp.loadFont(anton36WhitePath);
        const scoreWidth = Jimp.measureText(font, grade);
        const scoreHeight = Jimp.measureTextHeight(font, grade);
        blackBg.print(font, bgWidth - scoreWidth - 20, 10, grade);

        font = await Jimp.loadFont(anton16WhitePath);
        const scoreDescWidth = Jimp.measureText(font, gradDesc);
        const blackBgWidth = blackBg.getWidth();
        // blackBg.print(font, bgWidth - scoreWidth - 20, scoreHeight + 10, gradDesc);
        blackBg.print(
            font,
            blackBgWidth - 20 - scoreDescWidth,
            scoreHeight + 10,
            gradDesc
        );

        // Bottom text
        const anton24WhitePath = path.join(
            __dirname,
            "../../assets/fonts/white/anton24/anton.fnt"
        );
        linePadTop = 10;
        font = await Jimp.loadFont(anton24WhitePath);
        const serialNumber = "#12345"; // TODO: serial number
        blackBg.print(
            font,
            qrPositionX + logoQrWidth + 10,
            qrPositionY + linePadTop + 10,
            serialNumber
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

module.exports = createGradedImage;
