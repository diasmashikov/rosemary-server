const AWS = require("aws-sdk");
const fs = require("fs");

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new AWS.S3({
  region,
  accessKeyId,
  secretAccessKey,
});

function uploadFileCategory(file) {
  const fileStream = fs.createReadStream(file.path);
  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: "imagesCategory/" + file.filename,
  };

  return s3.upload(uploadParams).promise();
}

exports.uploadFileCategory = uploadFileCategory;

function deleteFileCategory(key) {
  return s3.deleteObject(
    {
      Bucket: bucketName,
      Key: "imagesCategory/" + key,
    },
    function (err, data) {}
  );
}

exports.deleteFileCategory = deleteFileCategory;

function getFileCategory(fileKey) {
  const downloadParams = {
    Key: "imagesCategory/" + fileKey,
    Bucket: bucketName,
  };

  return s3.getObject(downloadParams).createReadStream();
}

exports.getFileCategory = getFileCategory;
