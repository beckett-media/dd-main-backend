const AWS = require('aws-sdk');
const awsConfig = require('./config');

const s3 = new AWS.S3({
    accessKeyId: awsConfig.ACCESS_ID,
    secretAccessKey: awsConfig.ACCESS_KEY,
    region: awsConfig.REGION
});

module.exports = s3;
