const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/authenticateUser');
const appAuth = require('../../middlewares/authenticateApp');
const { Card } = require('../../models/card');
const { createResObject } = require('../../utils/utilFunctions');
const { stringConstants } = require('../../utils/constants');
const { errorObjects } = require('../../utils/errorObjects');
const combinedGrading = require('../../grading/combined');
const { totalGradeAvg } = require('../../grading/helper');

router.post(
    '/fetch',
    [appAuth, auth],
    async (req, res) => {
        const userId = req.user._id;
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
            const { front: filePath = '' } = card;
    
            const grading = await combinedGrading(cardId, filePath, userId);
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
    
            if (!grading.success) {
                return res
                .status(500)
                .send(
                    createResObject(
                        false,
                        {},
                        grading.error,
                        {
                            errorCode: 444,
                            errorSubCode: 'API_ERROR',
                            errorMessage: grading.error
                        }
                    )
                );
            }

        const { surface = {} } = grading;
        const { success = false } = surface;

        const overallGrade = success ? totalGradeAvg(grading) : {
            overallGrade: '',
            gradingComps: {}
        };
    
        return res.send(
            createResObject(
            true,
            {
                ...overallGrade
            },
            'Grade Fetch Success'
            )
        );
    }
)

module.exports = router;
