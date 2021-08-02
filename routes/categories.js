const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const Storage = require("../helpers/storage");

const ResponseController = require("../helpers/response-controller");
const FileHandler = require("../helpers/file-handler");
const { uploadFile, getFileStream } = require("../helpers/s3");

const storage = Storage.buildStorageCategories();

const uploadOptions = multer({ storage: storage });

getAllCategories();
getCategory();
getCategoryImage();
postCategory();
updateCategory();
deleteCategory();

function getAllCategories() {
  router.get(`/`, async (req, res) => {
    const categoryList = await _getAllCategoriesFromMongoDB();
    ResponseController.sendResponse(
      res,
      categoryList,
      "The category list is empty"
    );
  });
}

function _getAllCategoriesFromMongoDB() {
  return Category.find();
}

function getCategory() {
  router.get("/:id", async (req, res) => {
    const category = await _getCategoryFromMongoDB(req);

    ResponseController.sendResponse(
      res,
      category,
      "The category with given ID does not exist"
    );
  });
}

function _getCategoryFromMongoDB(req) {
  return Category.findById(req.params.id);
}

function getCategoryImage() {
  router.get("/images/:key", (req, res) => {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  });
}

function postCategory() {
  router.post("/", uploadOptions.single("image"), async (req, res) => {
    const file = req.file;
    ResponseController.validateExistence(res, file, "No image in the request");
    const result = await uploadFile(file);
    FileHandler.deleteFileFromUploads(file);
    const basePath = `${req.protocol}://${req.get("host")}/categories/images/`;
    const URL = `${basePath}${result.key}`;
    console.log(URL);
    let category = _createCategory(req, URL);
    category = await _postCategoryToMongoDB(category);
    ResponseController.sendResponse(
      res,
      category,
      "The category cannot be created"
    );
  });
}

function _createCategory(req, URL) {
  return new Category({
    name: req.body.name,
    image: URL,
  });
}

function _postCategoryToMongoDB(category) {
  return category.save();
}

function updateCategory() {
  router.put("/:id", async (req, res) => {
    const category = await _updateCategoryFromMongoDB(req);

    ResponseController.sendResponse(
      res,
      category,
      "The category cannot be updated"
    );
  });
}

function _updateCategoryFromMongoDB(req) {
  return Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      image: req.body.image,
    },
    { new: true }
  );
}

function deleteCategory() {
  router.delete("/:id", async (req, res) => {
    const category = await _deleteCategoryFromMongoDB(req);

    ResponseController.sendDeletionResponse(
      res,
      category,
      "The category is deleted",
      "The category is not found"
    );
  });
}

function _deleteCategoryFromMongoDB(req) {
  return Category.findByIdAndRemove(req.params.id);
}

module.exports = router;
