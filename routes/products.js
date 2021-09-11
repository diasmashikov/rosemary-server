const { Product } = require("../models/product");
const express = require("express");
const { Category } = require("../models/category");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const Storage = require("../helpers/storage");
const FileHandler = require("../helpers/file-handler");

const ResponseController = require("../helpers/response-controller");

const {
  uploadFileProduct,
  uploadFilesProduct,
  getFileProduct,
  deleteFileProduct,
  deleteFilesFolderProduct,
} = require("../helpers/s3");

const storage = Storage.buildStorageProducts();

const uploadOptions = multer({ storage: storage });

getAllProductsByCategory();
getProduct();
getTotalValue();
getNumberOfProducts();
getNumberOfFeaturedProducts();
getProductImage();
postProduct();
updateProduct();
deleteProduct();

function getAllProductsByCategory() {
  router.get(`/:category`, async (req, res) => {
    const productList = await _getAllProductsFromMongoDB(req.params.category);

    ResponseController.sendResponse(
      res,
      productList,
      "The product list is empty"
    );
  });
}

function _getAllProductsFromMongoDB(category) {
  return Product.find({
    category: mongoose.Types.ObjectId(category),
  }).populate("category");
}

function getProduct() {
  router.get(`/:id`, async (req, res) => {
    const product = await _getProductFromMongoDB();

    ResponseController.sendResponse(
      res,
      product,
      "The category with given ID does not exist"
    );
  });
}

function _getProductFromMongoDB(req) {
  return Product.findById(req.params.id).populate("category");
}

function getTotalValue() {
  router.get("/get/totalValue", async (req, res) => {
    const totalValue = await _getTotalValueFromMongoDB();

    console.log(totalValue);

    ResponseController.sendResponse(
      res,
      totalValue.pop(),
      "The total product value cannot be generated"
    );
  });
}

function _getTotalValueFromMongoDB() {
  return Product.aggregate([
    {
      $match: {
        countryProducer: "Казахстан",
      },
    },
    {
      $group: {
        _id: null,
        totalValue: { $sum: { $multiply: ["$price", "$countInStock"] } },
      },
    },
  ]);
}

function getNumberOfProducts() {
  router.get(`/get/count`, async (req, res) => {
    const productCount = await _getNumberOfProductsFromMongoDB();

    ResponseController.sendResponse(
      res,
      productCount.toString(),
      "There are no products"
    );
  });
}

function _getNumberOfProductsFromMongoDB() {
  return Product.countDocuments((count) => count);
}

function getNumberOfFeaturedProducts() {
  router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const products = await _getNumberOfFeaturedProductsFromMongoDB(count);

    if (!products) {
      res.status(500).json({ success: false });
    }
    res.send(products);
  });
}

function _getNumberOfFeaturedProductsFromMongoDB(count) {
  return Product.find({ isFeatured: true }).limit(+count);
}

function getProductImage() {
  router.get("/images/:keyFolder/:keyImage", (req, res) => {
    const keyFolder = req.params.keyFolder;
    const keyImage = req.params.keyImage;

    const readStream = getFileProduct(keyFolder, keyImage);
    readStream.pipe(res);
  });
}

function postProduct() {
  router.post(
    `/`,
    uploadOptions.fields([
      { name: "image", maxCount: 1 },
      { name: "images", maxCount: 10 },
    ]),
    async (req, res) => {
      const category = await _getCategoryFromMongoDB(req);

      ResponseController.validateExistence(res, category, "Invalid Category");

      const file = req.files.image[0];
      const files = req.files.images;

      let imagesPaths = [];

      /*
      ResponseController.validateExistence(
        res,
        file,
        "No image in the request"
      );
      */

      const result = await uploadFileProduct(file, req);

      const basePath = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/products/images/`;
      console.log(result.key);
      const keyFolder = result.key.split("/")[1];
      const keyImage = result.key.split("/")[2];

      const URL = `${basePath}${keyFolder}/${keyImage}`;

      const results = await uploadFilesProduct(files, req);

      results.map((result) => {
        const keyFolder = result.key.split("/")[1];
        const keyImage = result.key.split("/")[2];

        const URL = `${basePath}${keyFolder}/${keyImage}`;
        imagesPaths.push(URL);
      });

      let product = _createProduct(req, URL, imagesPaths);
      product = await _saveProductFromMongoDB(product);
      ResponseController.validateExistence(
        res,
        product,
        "The product cannot be created"
      );
      res.send(product);
    }
  );
}

function _getCategoryFromMongoDB(req) {
  return Category.findById(req.body.category);
}

function _createProduct(req, URL, imagesPaths) {
  return new Product({
    name: req.body.name,
    image: URL,
    images: imagesPaths,
    price: req.body.price,
    color: req.body.color,
    sizes: req.body.sizes,
    description: req.body.description,
    material: req.body.material,
    countryProducer: req.body.countryProducer,
    style: req.body.style,
    modelCharacteristics: req.body.modelCharacteristics,
    category: req.body.category,
    countInStock: req.body.countInStock,
    isFeatured: req.body.isFeatured,
  });
}

function _saveProductFromMongoDB(product) {
  return product.save();
}

function updateProduct() {
  router.put("/:id", uploadOptions.single("image"), async (req, res) => {
    ResponseController.validateExistence(
      res,
      mongoose.isValidObjectId(req.params.id),
      "Invalid product id"
    );

    const file = req.file;
    var URL;

    if (file != undefined) {
      const result = await uploadFileProduct(file);

      FileHandler.deleteFileFromUploads(file);
      const basePath = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/products/images/`;
      const key = result.key.split("/")[1];
      URL = `${basePath}${key}`;
    } else {
      URL = "";
    }

    const product = await _updateProductFromMongoDB(req, URL);

    if (file != undefined) {
      _deleteProductFromS3(req, product);
    }

    if (!product) return res.status(500).send("the product cannot be updated!");

    res.send(product);
  });
}

function _updateProductFromMongoDB(req, URL) {
  if (URL != "") {
    return Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        image: URL,
        price: req.body.price,
        color: req.body.color,
        sizes: req.body.sizes,
        description: req.body.description,
        material: req.body.material,
        countryProducer: req.body.countryProducer,
        style: req.body.style,
        modelCharacteristics: req.body.modelCharacteristics,
        category: req.body.category,
        countInStock: req.body.countInStock,
        isFeatured: req.body.isFeatured,
      },
      { new: false }
    );
  } else {
    return Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        price: req.body.price,
        color: req.body.color,
        sizes: req.body.sizes,
        description: req.body.description,
        material: req.body.material,
        countryProducer: req.body.countryProducer,
        style: req.body.style,
        modelCharacteristics: req.body.modelCharacteristics,
        category: req.body.category,
        countInStock: req.body.countInStock,
        isFeatured: req.body.isFeatured,
      },
      { new: true }
    );
  }
}

function deleteProduct() {
  router.delete("/:id", async (req, res) => {
    const product = await Product.findByIdAndRemove(req.params.id);
    _deleteProductFromS3(req, product);
    ResponseController.sendDeletionResponse(
      res,
      product,
      "The product is deleted",
      "The product is not found"
    );
  });
}

function _deleteProductFromS3(req, product) {
  // deleting image
  const imagePath = product.image.split("/");
  const keyFolder = imagePath[imagePath.length - 2];
  const keyImage = imagePath[imagePath.length - 1];

  deleteFileProduct(keyFolder, keyImage);

  // deleting all images[]
  const imagesPaths = product.images;

  imagesPaths.map((image) => {
    const imagePath = image.split("/");
    const keyFolderMultiple = imagePath[imagePath.length - 2];
    const keyImageMultiple = imagePath[imagePath.length - 1];
    deleteFileProduct(keyFolderMultiple, keyImageMultiple);
  });

  deleteFilesFolderProduct(keyFolder);
}

module.exports = router;
