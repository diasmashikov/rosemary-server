class ResponseHandler {
  constructor(res, codeStatus, message, json) {
    this.res = res;
    this.codeStatus = codeStatus;
    this.message = message;
    this.json = json;
  }
  static sendResponse(res, codeStatus, message) {
    return res.status(codeStatus).send(message);
  }
  static sendJSON(res, codeStatus, json) {
    return res.status(codeStatus).json(json);
  }
}

module.exports = ResponseHandler;
