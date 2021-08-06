const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const ResponseController = require("../helpers/response-controller");
const ResponseHandler = require("../helpers/response-handler");

getAllUsers();
getUser();
getNumberOfUsers();
postRegisterUser();
postLoginUser();
updateUser();
deleteUser();

function getAllUsers() {
  router.get(`/`, async (req, res) => {
    const userList = await _getAllUsersFromMongoDB();

    ResponseController.sendResponse(res, userList, "There are no users");
  });
}

function _getAllUsersFromMongoDB() {
  return User.find().select("-passwordHash");
}

function getUser() {
  router.get("/:id", async (req, res) => {
    const user = await _getUserFromMongoDB(req.params.id);
    ResponseController.sendResponse(res, user, "User not found");
  });
}

function _getUserFromMongoDB(id) {
  return User.findById(id).select("-passwordHash");
}

function getNumberOfUsers() {
  router.get(`/get/count`, async (req, res) => {
    const userCount = await _getNumberOfUsersFromMongoDB();

    ResponseController.sendResponse(
      res,
      userCount.toString(),
      "There are no users found"
    );
  });
}

function _getNumberOfUsersFromMongoDB() {
  return User.countDocuments((count) => count);
}

function postRegisterUser() {
  router.post("/register", async (req, res) => {
    let user = await _createUser(req);
    ResponseController.sendResponse(res, user, "The user cannot be created");
  });
}

function _createUser(req) {
  return _postUserToMongoDB(
    new User({
      name: req.body.name,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
      region: req.body.region,
      homeNumber: req.body.homeNumber,
    })
  );
}

function _postUserToMongoDB(user) {
  return user.save();
}

function postLoginUser() {
  router.post("/login", async (req, res) => {
    const user = await _getUserFromMongoDBtoPost(req);
    const secret = process.env.secret;

    ResponseController.validateExistence(res, user, "The user not found");

    _verifyPassword(req, res, user, secret);
  });
}

function _getUserFromMongoDBtoPost(req) {
  return User.findOne({ email: req.body.email });
}

function _verifyPassword(req, res, user, secret) {
  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = _signIn(user, secret);

    res.status(200).send({ user: user, token: token });
  } else {
    res.status(400).send("password is wrong!");
  }
}

function _signIn(user, secret) {
  return jwt.sign(
    {
      userId: user.id,
      isAdmin: user.isAdmin,
    },
    secret,
    { expiresIn: "1d" }
  );
}

//updates password for now
function updateUser() {
  router.put("/:id", async (req, res) => {
    const userForCheck = await _getUserFromMongoDBToUpdate(req);

    let newPassword = _updateOrNotPassword(req, userForCheck);

    const user = await _updateUserFromMongoDB(req, newPassword);

    ResponseHandler.sendResponse(res, user, "The user cannot be updated");
  });
}

function _getUserFromMongoDBToUpdate(req) {
  return User.findById(req.params.id);
}

function _updateOrNotPassword(req, user) {
  if (req.body.password) {
    return bcrypt.hashSync(req.body.password, 10);
  } else {
    return user.passwordHash;
  }
}

function _updateUserFromMongoDB(req, newPassword) {
  return User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      passwordHash: newPassword,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
      region: req.body.region,
      homeNumber: req.body.homeNumber,
    },
    { new: true }
  );
}

function deleteUser() {
  router.delete("/:id", (req, res) => {
    User.findByIdAndRemove(req.params.id)
      .then((user) => {
        if (user) {
          return res
            .status(200)
            .json({ success: true, message: "the user is deleted!" });
        } else {
          return res
            .status(404)
            .json({ success: false, message: "user not found!" });
        }
      })
      .catch((err) => {
        return res.status(500).json({ success: false, error: err });
      });
  });
}

module.exports = router;
