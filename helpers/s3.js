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

function deleteFileCategory(key) {
  return s3.deleteObject(
    {
      Bucket: bucketName,
      Key: "imagesCategory/" + key,
    },
    function (err, data) {}
  );
}

function getFileCategory(fileKey) {
  const downloadParams = {
    Key: "imagesCategory/" + fileKey,
    Bucket: bucketName,
  };

  return s3.getObject(downloadParams).createReadStream();
}

function uploadFileProduct(file, req) {
  const fileStream = fs.createReadStream(file.path);
  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key:
      "imagesProduct/" +
      `${req.body.name.split(" ").join("-")}-${req.body.color}/${
        file.filename
      }`,
  };

  console.log(file.filename);

  return s3.upload(uploadParams).promise();
}

function uploadFilesProduct(files, req) {
  const results = Promise.all(
    files.map((file) => {
      const fileStream = fs.createReadStream(file.path);
      const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key:
          "imagesProduct/" +
          `${req.body.name.split(" ").join("-")}-${req.body.color}/${
            file.filename
          }`,
      };
      return s3.upload(uploadParams).promise();
    })
  );

  return results;
}

function deleteFileProduct(key) {
  return s3.deleteObject(
    {
      Bucket: bucketName,
      Key: "imagesProduct/" + key,
    },
    function (err, data) {}
  );
}

function getFileProduct(keyFolder, keyImage) {
  const downloadParams = {
    Key: "imagesProduct/" + keyFolder + "/" + keyImage,
    Bucket: bucketName,
  };

  return s3.getObject(downloadParams).createReadStream();
}

function uploadFilePromotion(file) {
  const fileStream = fs.createReadStream(file.path);
  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: "imagesPromotion/" + file.filename,
  };

  return s3.upload(uploadParams).promise();
}

function deleteFilePromotion(key) {
  return s3.deleteObject(
    {
      Bucket: bucketName,
      Key: "imagesPromotion/" + key,
    },
    function (err, data) {}
  );
}

function getFilePromotion(fileKey) {
  const downloadParams = {
    Key: "imagesPromotion/" + fileKey,
    Bucket: bucketName,
  };

  return s3.getObject(downloadParams).createReadStream();
}

exports.uploadFileCategory = uploadFileCategory;
exports.getFileCategory = getFileCategory;
exports.deleteFileCategory = deleteFileCategory;

exports.uploadFileProduct = uploadFileProduct;
exports.uploadFilesProduct = uploadFilesProduct;
exports.getFileProduct = getFileProduct;
exports.deleteFileProduct = deleteFileProduct;

exports.uploadFilePromotion = uploadFilePromotion;
exports.getFilePromotion = getFilePromotion;
exports.deleteFilePromotion = deleteFilePromotion;
