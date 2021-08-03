const fsPromises = require('fs').promises;
const SimpleLogger = require('../utils/simpleLogger');
const { PendingDeletion } = require('../models/pendingDeletion');
const { stringConstants } = require('../utils/constants');
const path = require('path');

const cardHelper = {
    unlinkCard: async (files, userId, cardId) => {
        const cardFrontDestination = files[0] && files[0].filename ? path.join(
            __dirname,
            '../public/',
            `${userId}/cards/${cardId}/`,
            `${files[0].filename}`
        ) : null;
        const cardBackDestination = files[1] && files[1].filename ? path.join(
            __dirname,
            '../public/',
            `${userId}/cards/${cardId}/`,
            `${files[1].filename}`
        ) : null;
        try {
            cardFrontDestination && await fsPromises.unlink(cardFrontDestination);
            cardBackDestination && await fsPromises.unlink(cardBackDestination);
        } catch (err) {
            SimpleLogger.error(err);
            cardFrontDestination && await new PendingDeletion({
                deletionType: stringConstants.deletionType.FILE,
                data: cardFrontDestination,
            }).save();
            cardBackDestination && await new PendingDeletion({
                deletionType: stringConstants.deletionType.FILE,
                data: cardBackDestination,
            }).save();
        }
    }
};

module.exports = cardHelper;
