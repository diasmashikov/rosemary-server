const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const Storage = require("../helpers/storage");

const ResponseController = require("../helpers/response-controller");
const FileHandler = require("../helpers/file-handler");
const {
  uploadFileCategory,
  getFileCategory,
  deleteFileCategory,
} = require("../helpers/s3");

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
    const readStream = getFileCategory(key);
    readStream.pipe(res);
  });
}

function postCategory() {
  router.post("/", uploadOptions.single("image"), async (req, res) => {
    const file = req.file;
    ResponseController.validateExistence(res, file, "No image in the request");
    const result = await uploadFileCategory(file);
    FileHandler.deleteFileFromUploads(file);
    const basePath = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/categories/images/`;
    const key = result.key.split("/")[1];
    const URL = `${basePath}${key}`;
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
  router.put("/:id", uploadOptions.single("image"), async (req, res) => {
    const file = req.file;
    var URL;

    if (file != undefined) {
      const result = await uploadFileCategory(file);

      FileHandler.deleteFileFromUploads(file);
      const basePath = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/categories/images/`;
      const key = result.key.split("/")[1];
      URL = `${basePath}${key}`;
    } else {
      URL = "";
    }

    const category = await _updateCategoryFromMongoDB(req, URL);
    if (file != undefined) {
      _deleteCategoryFromS3(req, category);
    }

    ResponseController.sendResponse(
      res,
      category,
      "The category cannot be updated"
    );
  });
}

function _updateCategoryFromMongoDB(req, URL) {
  if (URL != "") {
    return Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        image: URL,
      },
      { new: false }
    );
  } else {
    return Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
      },
      { new: true }
    );
  }
}

function deleteCategory() {
  router.delete("/:id", async (req, res) => {
    const category = await _deleteCategoryFromMongoDB(req);

    _deleteCategoryFromS3(req, category);
    ResponseController.sendDeletionResponse(
      res,
      category,
      "The category is deleted",
      "The category is not found"
    );
  });
}

function _deleteCategoryFromMongoDB(req) {
  return Category.findByIdAndDelete(req.params.id);
}

function _deleteCategoryFromS3(req, category) {
  const imagePath = category.image.split("/");
  const key = imagePath[imagePath.length - 1];
  deleteFileCategory(key);
}

module.exports = router;
