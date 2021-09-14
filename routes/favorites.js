const express = require("express");
const { Favorite } = require("../models/favorite");
const mongoose = require("mongoose");
moment = require("moment-timezone");

const ResponseController = require("../helpers/response-controller");
const { Product } = require("../models/product");

const router = express.Router();

getAllFavoritesByUser();
postFavorite();
updateFavorite();
deleteFavorite();

function getAllFavoritesByUser() {
  router.get(`/:userId`, async (req, res) => {
    const favoritesList = await _getAllByFavoritesByUserFromMongoDB(
      req.params.userId
    );

    ResponseController.sendResponse(
      res,
      favoritesList,
      "The favorite list is empty"
    );
  });
}

function _getAllByFavoritesByUserFromMongoDB(userId) {
  return Favorite.find({ user: mongoose.Types.ObjectId(userId) });
}

function postFavorite() {
  router.post("/", async (req, res) => {
    let favoriteList = await _getAllByFavoritesByUserFromMongoDB(req.body.user);
    console.log(favoriteList);
    if (favoriteList.length > 0) {
      let newProducts = favoriteList[0].products;
      newProducts.push(...req.body.products);
      let favorite = await _updateFavoriteFromMongoDB(
        favoriteList[0]._id,
        newProducts
      );
      ResponseController.sendResponse(
        res,
        favorite,
        "The favorite cannot be updated"
      );
    } else {
      let favorite = await _createFavorite(req);
      ResponseController.sendResponse(
        res,
        favorite,
        "The favorite cannot be created"
      );
    }
  });
}

function _createFavorite(req) {
  return _postFavoriteToMongoDB(
    new Favorite({
      products: req.body.products,
      user: req.body.user,
    })
  );
}

function _postFavoriteToMongoDB(favorite) {
  return favorite.save();
}

function updateFavorite() {
  router.put("/:favoriteId", async (req, res) => {
    const favorite = await _updateFavoriteFromMongoDB(
      req.params.favoriteId,
      req.body.products
    );
    ResponseController.sendResponse(
      res,
      favorite,
      "The favorite cannot be updated"
    );
  });
}

function _updateFavoriteFromMongoDB(favoriteId, products) {
  return Favorite.findByIdAndUpdate(
    favoriteId,
    {
      products: products,
    },
    { new: true }
  );
}

function deleteFavorite() {
  router.delete("/:favoriteId", async (req, res) => {
    const favorite = await _deleteFavoriteFromMongoDB(req);

    ResponseController.sendDeletionResponse(
      res,
      favorite,
      "The favorite is deleted",
      "The favorite is not found"
    );
  });
}

function _deleteFavoriteFromMongoDB(req) {
  return Favorite.findByIdAndDelete(req.params.favoriteId);
}

module.exports = router;
