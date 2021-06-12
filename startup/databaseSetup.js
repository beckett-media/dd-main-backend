const questionaireScript = require("../init/initQuestions");
const subscriptionScript = require("../init/initSubscription");
const productScript = require("../init/initProduct");
const gradeScript = require("../init/initGrade");

module.exports = async () => {
	await questionaireScript();
	await subscriptionScript();
	await productScript();
	await gradeScript();
};
