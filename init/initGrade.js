const { Grade } = require("../models/grade");
const SimpleLogger = require("../utils/simpleLogger");

const rawGrade = {
	_id: "gradeRaw",
	name: "Raw",
};
const Grade100 = {
	_id: "Grade100",
	name: "10",
};
const Grade95 = {
	_id: "Grade95",
	name: "9.5",
};
const Grade90 = {
	_id: "Grade90",
	name: "9.0",
};
const Grade85 = {
	_id: "Grade85",
	name: "8.5",
};
const Grade80 = {
	_id: "Grade80",
	name: "8.0",
};
const Grade75 = {
	_id: "Grade75",
	name: "7.5",
};
const Grade70 = {
	_id: "Grade70",
	name: "7.0",
};
const Grade65 = {
	_id: "Grade65",
	name: "6.5",
};
const Grade60 = {
	_id: "Grade60",
	name: "6.0",
};
const Grade55 = {
	_id: "Grade55",
	name: "5.5",
};
const Grade50 = {
	_id: "Grade50",
	name: "5.0",
};
const Grade45 = {
	_id: "Grade45",
	name: "4.5",
};
const Grade40 = {
	_id: "Grade40",
	name: "4.0",
};
const Grade35 = {
	_id: "Grade35",
	name: "3.5",
};
const Grade30 = {
	_id: "Grade30",
	name: "3.0",
};
const Grade25 = {
	_id: "Grade25",
	name: "2.5",
};
const Grade20 = {
	_id: "Grade20",
	name: "2.0",
};
const Grade15 = {
	_id: "Grade15",
	name: "1.5",
};
const Grade10 = {
	_id: "Grade10",
	name: "1.0",
};
const gradeArray = [
	rawGrade,
	Grade100,
	Grade95,
	Grade90,
	Grade85,
	Grade80,
	Grade75,
	Grade70,
	Grade65,
	Grade60,
	Grade55,
	Grade50,
	Grade45,
	Grade40,
	Grade35,
	Grade30,
	Grade25,
	Grade20,
	Grade15,
	Grade10,
];

module.exports = async () => {
	try {
		const savedGrade = await Grade.find({}).lean();
		if (gradeArray.length > savedGrade.length) {
			await Grade.remove({});
			for (const grade of gradeArray) {
				let g = new Grade({
					_id: grade._id,
					name: grade.name,
				});
				g = await g.save();
			}
		}
	} catch (error) {
		SimpleLogger.error(error, true);
	}
};
