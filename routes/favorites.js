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
    const favoritesList = await _getAllByFavoritesByUserFromMongoDB();

    ResponseController.sendResponse(
      res,
      favoritesList,
      "The favorite list is empty"
    );
  });
}

function _getAllByFavoritesByUserFromMongoDB() {
  return Favorite.find();
}

function postFavorite() {
  router.post("/", async (req, res) => {
    let favorite = await _createFavorite(req);
    ResponseController.sendResponse(
      res,
      favorite,
      "The favorite cannot be created"
    );
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
    const favorite = await _updateFavoriteFromMongoDB(req);
    ResponseController.sendResponse(
      res,
      favorite,
      "The favorite cannot be updated"
    );
  });
}

function _updateFavoriteFromMongoDB(req) {
  return Favorite.findByIdAndUpdate(
    req.params.favoriteId,
    {
      products: req.body.products,
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
