const request = require('request');
const fs = require('fs');
const path = require('path');
const config = require('config');
const { gradePhase } = require('./helper');

const combinedGrading = (cardId, imagePath, userId) => {
    const options = {
        method: 'POST',
        url: config.get('gradeAPI'),
        headers: {
            "Content-Type": "multipart/form-data"
        },
        formData: {
            user_id: userId,
            report_id: cardId,
            image: fs.createReadStream(path.join(__dirname, './../public/', imagePath)),
            device: 'node',
            phrase: gradePhase()
        }
    };

    const promise = new Promise((resolve, reject) => {
        request(options, function (err, res, body) {
            if (err) {
                console.log(err);
                resolve(0);
            } else {
                try {
                    const data = typeof body === 'string' && !body.includes('error') ? JSON.parse(body) : body;
                    resolve(data);
                }catch (error) {
                    console.log(error);
                    resolve(0);
                }
                resolve(body);
            }
        });
    });
    return promise;
}

module.exports = combinedGrading;
