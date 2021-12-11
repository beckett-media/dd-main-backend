const uploadFileMapping = require('./uploadFileMapping');
const s3 = require('./bucketInstance');

const upload = (key, uploadType, fileContent, ContentType = 'png') => {

    // Setting up S3 upload parameters
    const params = {
        Bucket: uploadFileMapping[uploadType]['bucket'],
        Key: key,
        Body: fileContent,
        ContentType
    };

    // Uploading files to the bucket
    return s3.upload(params).promise();
};

module.exports = upload;
