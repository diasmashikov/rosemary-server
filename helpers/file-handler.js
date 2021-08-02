const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

class FileHandler {
  static deleteFileFromUploads(file) {
    unlinkFile(file.path);
  }
}

module.exports = FileHandler;
