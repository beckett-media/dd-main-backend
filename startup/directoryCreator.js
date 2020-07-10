const fs = require("fs");
const path = require("path");

module.exports = () => {
  let dirNames = [];

  const logFolder = path.join(__dirname, "../logs");
  const publicFolder = path.join(__dirname, "../public");
  const profilePicFolder = path.join(publicFolder, "/profile_pictures");
  const cardFrontsFolder = path.join(publicFolder, "/card_fronts");
  const cardBacksFolder = path.join(publicFolder, "/card_backs");
  const cardVideosFolder = path.join(publicFolder, "/card_videos");

  dirNames.push(logFolder);
  dirNames.push(publicFolder);
  dirNames.push(profilePicFolder);
  dirNames.push(cardFrontsFolder);
  dirNames.push(cardBacksFolder);
  dirNames.push(cardVideosFolder);

  for (const dirName of dirNames) {
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName);
    }
  }
};
