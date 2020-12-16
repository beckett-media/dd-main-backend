const request = require('request');
const fs = require('fs');
const path = require('path');
const { url = '', point = '' } = require('./apiconfig');

const centerGrade = (name, imagePath) => {
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
                resolve({});
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
                resolve(result);
            }
        });
    });
    return promise;
}

module.exports = centerGrade;
