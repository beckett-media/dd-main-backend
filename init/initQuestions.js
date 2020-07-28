const { Question } = require("../models/question");
const SimpleLogger = require("../utils/simpleLogger");

const signedCeleb = {
  _id: "signedCeleb",
  desc: "Signed By Celebrity",
  options: [
    { _id: "notSigned", name: "Not Signed", points: 0 },
    { _id: "lowLevelCelebrity", name: "Low Level Celebrity", points: 1000 },
    { _id: "highLevelCelebrity", name: "High Level Celebrity", points: 2000 },
  ],
  maxPoints: 2000,
};

const cornerValue = {
  _id: "cornerValue",
  desc: "Card Corners",
  options: [
    { _id: "damaged", name: "Damaged", points: 50 },
    { _id: "significantlyRounded", name: "Significantly Rounded", points: 150 },
    { _id: "slightlyRounded", name: "Slightly Rounded", points: 300 },
    { _id: "weak", name: "Weak", points: 400 },
    { _id: "sharpSquared", name: "Sharp Squared", points: 600 },
  ],
  maxPoints: 600,
};

const edgeValue = {
  _id: "edgeValue",
  desc: "Card Edges",
  options: [
    { _id: "cardboardShowsOff", name: "Cardboard Shows Off", points: -50 },
    { _id: "extChoppedOff", name: "Ext Chipped Off", points: 100 },
    { _id: "choppedOff", name: "Chipped Off", points: 300 },
    { _id: "weakEdges", name: "Weak Edges", points: 400 },
    { _id: "sharp", name: "Sharp", points: 600 },
  ],
  maxPoints: 600,
};

const surfaceValue = {
  _id: "surfaceValue",
  desc: "Surface",
  options: [
    { _id: "warpedMissingPeices", name: "Warped Missing Pieces", points: 0 },
    { _id: "prevalent", name: "Prevalent", points: 80 },
    { _id: "minorCracks", name: "Minor Cracks", points: 200 },
    { _id: "lessSmooth", name: "Less Smooth", points: 400 },
    { _id: "smooth", name: "Smooth", points: 500 },
    { _id: "extremelySmooth", name: "Extremely Smooth", points: 600 },
  ],
  maxPoints: 600,
};

const eyeAppeal = {
  _id: "eyeAppeal",
  desc: "Eye Appeal",
  options: [
    { _id: "negative", name: "Negative", points: -50 },
    { _id: "none", name: "None", points: 0 },
    { _id: "less", name: "Less", points: 80 },
    { _id: "almostGood", name: "Almost Good", points: 300 },
    { _id: "good", name: "Good", points: 400 },
    { _id: "outstanding", name: "Outstanding", points: 500 },
  ],
  maxPoints: 500,
};

const centerFront = {
  _id: "centerFront",
  desc: "Centering Front",
  options: [
    { _id: "1", name: "1", points: 100 },
    { _id: "2", name: "2", points: 90 },
    { _id: "3", name: "3", points: 80 },
    { _id: "4", name: "4", points: 70 },
    { _id: "5", name: "5", points: 50 },
    { _id: "6", name: "6", points: 25 },
    { _id: "7", name: "7", points: 15 },
    { _id: "8", name: "8", points: -10 },
  ],
  maxPoints: 100,
};

const centerBack = {
  _id: "centerBack",
  desc: "Centring Back",
  options: [
    { _id: "1", name: "1", points: 50 },
    { _id: "2", name: "2", points: 20 },
    { _id: "3", name: "3", points: -20 },
  ],
  maxPoints: 50,
};

const cardStains = {
  _id: "cardStains",
  desc: "Stains On The Card",
  options: [
    { _id: "none", name: "None", points: 200 },
    { _id: "smallDots", name: "Small Dots", points: 160 },
    { _id: "offWhiteBorders", name: "Off White Borders", points: 100 },
    { _id: "majorDots", name: "Major Dots", points: 60 },
    { _id: "prevalent", name: "Prevalent", points: 20 },
    { _id: "discolored", name: "Discolored", points: -20 },
    { _id: "distorted", name: "Distorted", points: -50 },
  ],
  maxPoints: 200,
};

const cardSleeving = {
  _id: "cardSleeving",
  desc: "Card Sleeving",
  options: [
    { _id: "none", name: "None", points: 0 },
    { _id: "hardToNotice", name: "Hard To Notice", points: -10 },
    { _id: "minorCrease", name: "Minor Crease", points: -20 },
    { _id: "majorCrease", name: "Major Crease", points: -50 },
    { _id: "severalCrease", name: "Several Crease", points: -100 },
  ],
  maxPoints: 0,
};

const printingDefects = {
  _id: "printingDefects",
  desc: "Printing Defects",
  options: [
    { _id: "none", name: "None", points: 0 },
    { _id: "1star", name: "1 Star", points: -125 },
    { _id: "5star", name: "5 Star", points: -600 },
  ],
  maxPoints: 0,
};

const questionArray = [
  signedCeleb,
  cornerValue,
  edgeValue,
  surfaceValue,
  eyeAppeal,
  centerFront,
  centerBack,
  cardStains,
  cardSleeving,
  printingDefects,
];

module.exports = async () => {
  try {
    const savedQuestions = await Question.find({}).lean();
    if (questionArray.length > savedQuestions.length) {
      await Question.remove({});
      for (const question of questionArray) {
        let q = new Question({
          _id: question._id,
          desc: question.desc,
          options: question.options,
          maxPoints: question.maxPoints,
        });
        q = await q.save();
      }
    }
  } catch (error) {
    SimpleLogger.error(error, true);
  }
};
