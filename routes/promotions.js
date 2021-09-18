const { Promotion } = require("../models/promotion");
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const Storage = require("../helpers/storage");
const ResponseController = require("../helpers/response-controller");
const FileHandler = require("../helpers/file-handler");

const router = express.Router();

const {
  uploadFilePromotion,
  getFilePromotion,
  deleteFilePromotion,
} = require("../helpers/s3");

const storage = Storage.buildStoragePromotions();

const uploadOptions = multer({ storage: storage });

getAllPromotions();
getPromotionImage();
postPromotion();
updatePromotion();
deletePromotion();

function getAllPromotions() {
  router.get(`/`, async (req, res) => {
    const promotionsList = await _getAllPromotionsFromMongoDB();
    ResponseController.sendResponse(
      res,
      promotionsList,
      "The order list is empty"
    );
  });
}

function _getAllPromotionsFromMongoDB() {
  return Promotion.find();
}

function getPromotionImage() {
  router.get("/images/:key", (req, res) => {
    const key = req.params.key;
    const readStream = getFilePromotion(key);
    readStream.pipe(res);
  });
}

function postPromotion() {
  router.post("/", uploadOptions.single("image"), async (req, res) => {
    console.log(req.body);
    const file = req.file;
    ResponseController.validateExistence(res, file, "No image in the request");
    const result = await uploadFilePromotion(file);
    FileHandler.deleteFileFromUploads(file);
    const basePath = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/promotions/images/`;
    const keyArrays = result.key.split("/");
    const key = keyArrays[keyArrays.length - 1];
    console.log(key);
    const URL = `${basePath}${key}`;
    console.log(URL);
    let promotion = await _createPromotion(req, URL);

    ResponseController.sendResponse(
      res,
      promotion,
      "The promotion cannot be created"
    );
  });
}

function _createPromotion(req, URL) {
  return _postPromotionToMongoDB(
    new Promotion({
      firstLine: req.body.firstLine,
      secondLine: req.body.secondLine,
      thirdLine: req.body.thirdLine,
      description: req.body.description,
      activePeriod: req.body.activePeriod,
      slogan: req.body.slogan,
      image: URL,
    })
  );
}

function _postPromotionToMongoDB(promotion) {
  return promotion.save();
}

function updatePromotion() {}

function deletePromotion() {
  router.delete("/:id", async (req, res) => {
    const promotion = await _deletePromotionFromMongoDB(req);
    _deletePromotionFromS3(req, promotion);
    ResponseController.sendDeletionResponse(
      res,
      promotion,
      "The promotion is deleted",
      "The promotion is not found"
    );
  });
}

function _deletePromotionFromMongoDB(req) {
  return Promotion.findByIdAndDelete(req.params.id);
}

function _deletePromotionFromS3(req, promotion) {
  const imagePath = promotion.image.split("/");
  const key = imagePath[imagePath.length - 1];
  deleteFilePromotion(key);
}

module.exports = router;
