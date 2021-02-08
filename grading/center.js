const request = require('request');
const fs = require('fs');
const path = require('path');
const { center: { url = '', point = '' } } = require('./apiconfig');
const { roughScale } = require('./helper');

const centerGrading = (name, imagePath) => {
    const options = {
        method: 'POST',
        url: `${url}/${point}`,
        headers: {
            "Content-Type": "multipart/form-data"
        },
        formData: {
            name: `grade_${name}`,
            image: fs.createReadStream(path.join(__dirname, './../public/', imagePath))
        }
    };

    const promise = new Promise((resolve, reject) => {
        request(options, function (err, res, body) {
            if (err) {
                console.log(err);
                resolve(0);
            } else {
                const { formData = {} } = options;
                const { name = '' } = formData;
                const fileDestination = path.join(
                    __dirname,
                    `../public/${point}`
                );
                const exists = fs.existsSync(fileDestination);
                if (!exists) fs.mkdirSync(fileDestination);
                const writeStream = fs.createWriteStream(`${fileDestination}/${name}`);
                writeStream.write(body);
                writeStream.end();
                const grade = roughScale(body, 10);
                resolve(grade);
            }
        });
    });
    return promise;
}

module.exports = centerGrading;
