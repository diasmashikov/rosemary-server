const { Product } = require("../models/product");
const express = require("express");
const { Category } = require("../models/category");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const Storage = require("../helpers/storage");
const ResponseController = require("../helpers/response-controller");

const {
  uploadFileProduct,
  getFileProduct,
  deleteFileProduct,
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
upsertProductImages();
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
  router.get("/images/:key", (req, res) => {
    const key = req.params.key;
    const readStream = getFileProduct(key);
    readStream.pipe(res);
  });
}

function postProduct() {
  router.post(`/`, uploadOptions.single("image"), async (req, res) => {
    const category = await _getCategoryFromMongoDB(req);

    ResponseController.validateExistence(res, category, "Invalid Category");

    const file = req.file;

    ResponseController.validateExistence(res, file, "No image in the request");

    const result = await uploadFileProduct(file);

    const basePath = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/products/images/`;
    const key = result.key.split("/")[1];
    const URL = `${basePath}${key}`;
    let product = _createProduct(req, URL);
    product = await _saveProductFromMongoDB(product);
    ResponseController.validateExistence(
      res,
      product,
      "The product cannot be created"
    );
    res.send(product);
  });
}

function _getCategoryFromMongoDB(req) {
  return Category.findById(req.body.category);
}

function _createProduct(req, URL) {
  return new Product({
    name: req.body.name,
    image: URL,
    price: req.body.price,
    color: req.body.color,
    size: req.body.size,
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

    const category = await Category.findById(req.body.category);
    ResponseController.validateExistence(res, category, "Invalid category");

    const product = await Product.findById(req.params.id);
    ResponseController.validateExistence(res, product, "Invalid product");

    const file = req.file;
    let imagePath = _validateFileUpdate(req, file, product);

    const updatedProduct = await _updateProductFromMongoDB(req, imagePath);

    if (!updatedProduct)
      return res.status(500).send("the product cannot be updated!");

    res.send(updatedProduct);
  });
}

function _validateFileUpdate(req, file, product) {
  if (file) {
    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    return `${basePath}${fileName}`;
  } else {
    return product.image;
  }
}

function _updateProductFromMongoDB(req, imagePath) {
  return Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      image: imagePath,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );
}

function upsertProductImages() {
  router.put(
    "/gallery-images/:id",
    uploadOptions.array("images", 10),
    async (req, res) => {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send("Invalid Product Id");
      }
      const files = req.files;
      let imagesPaths = [];
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

      if (files) {
        files.map((file) => {
          imagesPaths.push(`${basePath}${file.filename}`);
        });
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
          images: imagesPaths,
        },
        { new: true }
      );

      if (!product)
        return res.status(500).send("the gallery cannot be updated!");

      res.send(product);
    }
  );
}

function deleteProduct() {
  router.delete("/:id", (req, res) => {
    Product.findByIdAndRemove(req.params.id)
      .then((product) => {
        if (product) {
          return res.status(200).json({
            success: true,
            message: "the product is deleted!",
          });
        } else {
          return res
            .status(404)
            .json({ success: false, message: "product not found!" });
        }
      })
      .catch((err) => {
        return res.status(500).json({ success: false, error: err });
      });
  });
}

module.exports = router;
