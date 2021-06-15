const { Product } = require("../models/product");
const SimpleLogger = require("../utils/simpleLogger");

const singleCard = {
	_id: "singleCard",
	name: "Single",
	desc: "single card",
	options: [],
};
const boxCard = {
	_id: "boxCard",
	name: "Box",
	desc: "Box Cards",
	options: [
		{ _id: "retailBox", name: "Retail Box", desc: "Retail Box Cards" },
		{ _id: "hobbyBox", name: "Hobby Box", desc: "Hobby Box Cards" },
		{
			_id: "jumboHobbyBox",
			name: "Jumbo Hobby Box",
			desc: "Jumbo Hobby Box Cards",
		},
	],
};
const packCard = {
	_id: "packCard",
	name: "Pack",
	desc: "Pack Cards",
	options: [
		{ _id: "retailPack", name: "Retail Pack", desc: "Retail Pack Cards" },
		{ _id: "hobbyPack", name: "Hobby Pack", desc: "Hobby Pack Cards" },
	],
};
const teamSetCard = {
	_id: "teamSetCard",
	name: "Team Set",
	desc: "Team Set",
	options: [],
};
const caseCard = {
	_id: "caseCard",
	name: "Cases",
	desc: "Cases Box",
	options: [
		{ _id: "1BoxCase", name: "1 Box Case", desc: "1 Box Case Card" },
		{ _id: "2BoxCase", name: "2 Box Case", desc: "2 Box Case Card" },
	],
};

const productArray = [singleCard, boxCard, packCard, teamSetCard, caseCard];

module.exports = async () => {
	try {
		const savedProduct = await Product.find({}).lean();
		if (productArray.length > savedProduct.length) {
			await Product.remove({});
			for (const product of productArray) {
				let p = new Product({
					_id: product._id,
					name: product.name,
					desc: product.desc,
					options: product.options,
				});
				p = await p.save();
			}
		}
	} catch (error) {
		SimpleLogger.error(error, true);
	}
};
