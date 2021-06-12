const questionaireScript = require("../init/initQuestions");
const productScript = require("../init/initProduct");
const gradeScript = require("../init/initGrade");

module.exports = async () => {
	await questionaireScript();
	await productScript();
	await gradeScript();
};
