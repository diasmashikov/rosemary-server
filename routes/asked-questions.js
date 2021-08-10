const { AskedQuestion } = require("../models/asked_question");
const express = require("express");
const router = express.Router();
const ResponseController = require("../helpers/response-controller");

getAllAskedQuestions();
postAskedQuestion();
updateAskedQuestion();
deleteAskedQuestion();

function getAllAskedQuestions() {
  router.get(`/`, async (req, res) => {
    const askedQuestionsList = await _getAllAskedQuestionsFromMongoDB();
    ResponseController.sendResponse(
      res,
      askedQuestionsList,
      "The asked question list is empty"
    );
  });
}

function _getAllAskedQuestionsFromMongoDB() {
  return AskedQuestion.find();
}

function postAskedQuestion() {
  router.post("/", async (req, res) => {
    let askedQuestion = await _createAskedQuestion(req);
    ResponseController.sendResponse(
      res,
      askedQuestion,
      "The asked question cannot be created"
    );
  });
}

function _createAskedQuestion(req) {
  return _postAskedQuestionToMongoDB(
    new AskedQuestion({
      title: req.body.title,
      description: req.body.description,
    })
  );
}

function _postAskedQuestionToMongoDB(askedQuestion) {
  return askedQuestion.save();
}

function updateAskedQuestion() {
  router.put("/:id", async (req, res) => {
    const category = await _updateAskedQuestionFromMongoDB(req);

    ResponseController.sendResponse(
      res,
      category,
      "The asked question cannot be updated"
    );
  });
}

function _updateAskedQuestionFromMongoDB(req) {
  return AskedQuestion.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      image: req.body.image,
    },
    { new: true }
  );
}

function deleteAskedQuestion() {
  router.delete("/:id", async (req, res) => {
    const category = await _deleteAskedQuestionFromMongoDB(req);
    ResponseController.sendDeletionResponse(
      res,
      category,
      "The asked question is deleted",
      "The asked question is not found"
    );
  });
}

function _deleteAskedQuestionFromMongoDB(req) {
  return AskedQuestion.findByIdAndDelete(req.params.id);
}

module.exports = router;
