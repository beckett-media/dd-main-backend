const request = require("request");
const fs = require("fs");
const path = require("path");
const config = require("config");
const { gradePhase } = require("./helper");
const { logHandledErrorAsCritical } = require("../services/rollbar.service");

const combinedGrading = (cardId, imagePath, userId, newApp = false) => {
  const clientS3Path = config.get("clientS3Path");
  const options = {
    method: "POST",
    url: newApp ? config.get("gradeAPIV1") : config.get("gradeAPI"),
    headers: {
      "Content-Type": "multipart/form-data",
    },
    formData: newApp
      ? {
          user_id: userId,
          report_id: cardId,
          image_url: `${clientS3Path}${imagePath}`,
          device: "node",
          phrase: gradePhase(),
        }
      : {
          user_id: userId,
          report_id: cardId,
          image: fs.createReadStream(
            path.join(__dirname, "./../public/", imagePath)
          ),
          device: "node",
          phrase: gradePhase(),
        },
  };

  const promise = new Promise((resolve, reject) => {
    request({
      ...options
    }, function (err, res, body) {
      if (err) {
        console.log(err);
        logHandledErrorAsCritical(`Grading API Not working ${err.message}`);

        resolve(0);
      } else {
        try {
          const data =
            typeof body === "string" && !body.includes("error")
              ? JSON.parse(body)
              : body;
          resolve(data);
        } catch (error) {
          console.log(error);
          logHandledErrorAsCritical(`Grading API Not working ${err.message}`);

          resolve(0);
        }
        resolve(body);
      }
    });
  });
  return promise;
};

module.exports = combinedGrading;
