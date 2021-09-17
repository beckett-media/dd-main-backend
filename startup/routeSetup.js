const user = require("../routes/user/user");
const subscription = require("../routes/user/subscription");
const cardGrading = require("../routes/user/cardGrading");
const collection = require("../routes/myCollection/collection");
const authenticate = require("../routes/user/authenticate");
const payment = require("../routes/user/payment");
const authToken = require("../routes/common/authToken");
const sportsCard = require("../routes/user/sportsCard");
const ebay = require("../routes/user/ebay");
const pay = require("../routes/user/pay");
const notificaiton = require("../routes/user/testNotifications");
const marketplace = require("../routes/marketPlace/home");
const listing = require("../routes/marketPlace/listing");
const storeListing = require("../routes/marketStore/store-listing");
const marketStore = require("../routes/marketStore/store");
const product = require("../routes/open/product");
const store = require("../routes/open/store");
const grade = require("../routes/open/grade");
const cart = require("../routes/cart/cart");
const order = require("../routes/order/index");
const address = require("../routes/marketPlace/address");
// Admin routes
const adminAuth = require("../routes/admin/authenticate");
const adminSportsCard = require("../routes/admin/sportsCard");
const adminQuestions = require("../routes/admin/questions");
// Public routes that don't even require app token
const publicSportsCard = require("../routes/open/sportsCard");

module.exports = (app) => {
	// Import route and use app.use();
	app.use("/user", user);
	app.use("/subscription", subscription);
	app.use("/card-grading", cardGrading);
	app.use("/collection", collection);
	app.use("/authenticate", authenticate);
	app.use("/payment", payment);
	app.use("/auth-token", authToken);
	app.use("/sports-card", sportsCard);
	app.use("/ebay", ebay);
	app.use("/pay", pay);
	app.use("/marketplace", marketplace);
	app.use("/listing", listing);
	app.use("/store-listing", storeListing);
	app.use("/store", marketStore);
	app.use("/cart", cart);
	app.use("/order", order);
	app.use("/address", address);
	// Test notificaiton route
	app.use("/notification", notificaiton);
	// Admin routes
	app.use("/admin-auth", adminAuth);
	app.use("/admin-sports-card", adminSportsCard);
	app.use("/admin-questions", adminQuestions);
	// Public routes
	app.use("/public-cards", publicSportsCard);
	app.use("/public-products", product);
	app.use("/public-stores", store);
	app.use("/public-grade", grade);
};
