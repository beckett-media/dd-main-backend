const request = require('request');
const fs = require('fs');
const path = require('path');
const { combined: { url = '', point = '' } } = require('./apiconfig');

const combinedGrading = (name, imagePath) => {
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
                try {
                    const data = JSON.parse(body);
                    resolve(data);
                }catch (error) {
                    resolve(0);
                    console.log(error);
                }
                resolve(body);
            }
        });
    });
    return promise;
}

module.exports = combinedGrading;
