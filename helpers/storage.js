const multer = require("multer");
var path = require("path");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
  "image/JPG": "JPG",
};

class Storage {
  static buildStorageProducts() {
    return multer.diskStorage({
      destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error("invalid image type");

        if (isValid) {
          uploadError = null;
        }
        cb(uploadError, "public/uploads/products");
      },
      filename: function (req, file, cb) {
        const fileName = path.parse(
          file.originalname.split(" ").join("-")
        ).name;
        const extension = path.extname(file.originalname);
        cb(null, fileName + "-" + Date.now() + extension);
      },
    });
  }

  static buildStorageCategories() {
    return multer.diskStorage({
      destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error("invalid image type");

        if (isValid) {
          uploadError = null;
        }
        cb(uploadError, "public/uploads/categories");
      },
      filename: function (req, file, cb) {
        const fileName = path.parse(
          file.originalname.split(" ").join("-")
        ).name;
        const extension = path.extname(file.originalname);
        cb(null, fileName + "-" + Date.now() + extension);
      },
    });
  }

  static buildStoragePromotions() {
    return multer.diskStorage({
      destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error("invalid image type");

        if (isValid) {
          uploadError = null;
        }
        cb(uploadError, "public/uploads/promotions");
      },
      filename: function (req, file, cb) {
        const fileName = path.parse(
          file.originalname.split(" ").join("-")
        ).name;
        const extension = path.extname(file.originalname);
        cb(null, fileName + "-" + Date.now() + extension);
      },
    });
  }
}

module.exports = Storage;
