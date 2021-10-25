const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/authenticateUser');
const appAuth = require('../../middlewares/authenticateApp');
const { Card } = require('../../models/card');
const { createResObject } = require('../../utils/utilFunctions');
const { stringConstants } = require('../../utils/constants');
const { errorObjects } = require('../../utils/errorObjects');
const { totalGradeAvg } = require('../../grading/helper');

router.post(
    '/fetch',
    [appAuth, auth],
    async (req, res) => {
        const cardId = req.body.cardId;
        const card = await Card.findById(cardId);
  
        // if no card found
        if (!card)
            return res
            .status(400)
            .send(
                createResObject(
                false,
                {},
                stringConstants.NO_CARD,
                errorObjects.NO_CARD
                )
            );
    
            // grading of card
            const { grading = {} } = card;
    
            if (grading === 0) {
                return res
                .status(500)
                .send(
                createResObject(
                    false,
                    {},
                    stringConstants.API_ERROR,
                    errorObjects.API_ERROR
                )
                );
            }
    
            if (!(grading.surface && grading.surface.success)) {
                return res
                .status(500)
                .send(
                    createResObject(
                        false,
                        {},
                        stringConstants.GRADE_NOT_FOUND,
                        errorObjects.GRADE_NOT_FOUND
                    )
                );
            }

        const { surface = {}, card_grade = '' } = grading;
        const { success = false } = surface;

        const overallGrade = success ? totalGradeAvg(grading, card_grade) : {
            overallGrade: '',
            gradingComps: {}
        };

        const cardData = card.getCardDetailsWithGrading();
    
        return res.send(
            createResObject(
            true,
            {
                ...cardData,
                ...overallGrade
            },
            'Grade Fetch Success'
            )
        );
    }
)

module.exports = router;
