const express = require("express");
const router = express.Router();
const appAuth = require("../../middlewares/authenticateApp");
const adminAuth = require("../../middlewares/authenticateAdmin");
const { Question } = require("../../models/question");
const { createResObject } = require("../../utils/utilFunctions");
const { stringConstants } = require("../../utils/constants");

router.get("/grading-questions", [appAuth, adminAuth], async (req, res) => {
  const questions = await Question.find({});

  return res.send(
    createResObject(
      true,
      { questions: questions },
      stringConstants.FETCH_SUCESSFUL
    )
  );
});
module.exports = router;
