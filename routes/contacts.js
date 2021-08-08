const { Contact } = require("../models/contact");
const express = require("express");
const ResponseController = require("../helpers/response-controller");

const router = express.Router();

getContacts();
postContacts();
putContacts();

function getContacts() {
  router.get(`/`, async (req, res) => {
    const contacts = await _getContactsFromMongoDB();
    ResponseController.sendResponse(res, contacts, "The contacts is empty");
  });
}

function _getContactsFromMongoDB() {
  return Contact.find();
}

function postContacts() {
  router.post("/", async (req, res) => {
    let contacts = await _createContacts(req);
    ResponseController.sendResponse(
      res,
      contacts,
      "The contacts cannot be created"
    );
  });
}

function _createContacts(req) {
  return _postContactsToMongoDB(
    new Contact({
      phoneNumbers: req.body.phoneNumbers,
      socialMedias: req.body.socialMedias,
      workingSchedule: req.body.workingSchedule,
    })
  );
}

function _postContactsToMongoDB(contacts) {
  return contacts.save();
}

function putContacts() {
  router.put("/:id", async (req, res) => {
    let contacts = await _updateContacts(req);
    ResponseController.sendResponse(
      res,
      contacts,
      "The contacts cannot be created"
    );
  });
}

function _updateContacts(req) {
  return Contact.findByIdAndUpdate(
    req.params.id,
    {
      phoneNumbers: req.body.phoneNumbers,
      socialMedias: req.body.socialMedias,
      workingSchedule: req.body.workingSchedule,
    },
    { new: true }
  );
}

module.exports = router;
