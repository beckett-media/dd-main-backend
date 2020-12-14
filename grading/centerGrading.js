const request = require('request');
const fs = require('fs');
const path = require('path');
const { centerGrading = {} } = require('./apiconfig');
const { url = '', point = '' } = centerGrading;

const centerGrade = async (name, imagePath, cb) => {
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

    request(options, function (err, res, body) {
        if (err) {
            console.log(err);
            cb(0);
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
            const result = parseInt(body, 10);
            cb(result);
        }
    });
}

module.exports = centerGrade;
