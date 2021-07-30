const ResponseHandler = require("../helpers/response-handler");

class ResponseController {
  static sendResponse(res, mongoDbQueryResult, message) {
    if (!mongoDbQueryResult) {
      ResponseHandler().sendJSON(res, 500, {
        message: message,
        success: false,
      });
    }
    return ResponseHandler.sendResponse(res, 200, mongoDbQueryResult);
  }

  static sendDeletionResponse(
    res,
    mongoDbQueryResult,
    successMessage,
    failureMessage
  ) {
    if (!mongoDbQueryResult) {
      ResponseHandler.sendJSON(res, 500, {
        message: failureMessage,
        success: false,
      });
    }
    ResponseHandler.sendResponse(res, 200, successMessage);
  }

  static validateExistence(res, mongoDbQueryResult, failureMessage) {
    if (!mongoDbQueryResult) return res.status(400).send(failureMessage);
  }
}

module.exports = ResponseController;
