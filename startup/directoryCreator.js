const fs = require("fs");
const path = require("path");

module.exports = () => {
  let dirNames = [];

  const logFolder = path.join(__dirname, "../logs");
  const publicFolder = path.join(__dirname, "../public");

  dirNames.push(logFolder);
  dirNames.push(publicFolder);

  for (const dirName of dirNames) {
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName);
    }
  }
};
