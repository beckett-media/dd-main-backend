const user = require("../routes/user/user");
const authenticate = require("../routes/user/authenticate");
const payment = require("../routes/user/payment");
const authToken = require("../routes/common/authToken");
const sportsCard = require("../routes/user/sportsCard");
const ebay = require("../routes/user/ebay");
const pay = require("../routes/user/pay");
const notificaiton = require("../routes/user/testNotifications");
// Admin routes
const adminAuth = require("../routes/admin/authenticate");
const adminSportsCard = require("../routes/admin/sportsCard");
const adminQuestions = require("../routes/admin/questions");
// Public routes that don't even require app token
const publicSportsCard = require("../routes/open/sportsCard");
// Test route
const testUser = require("../routes/admin/user");

module.exports = (app) => {
  // Import route and use app.use();
  app.use("/user", user);
  app.use("/authenticate", authenticate);
  app.use("/payment", payment);
  app.use("/auth-token", authToken);
  app.use("/sports-card", sportsCard);
  app.use("/ebay", ebay);
  app.use("/pay", pay);
  // Test notificaiton route
  app.use("/notification", notificaiton);
  // Admin routes
  app.use("/admin-auth", adminAuth);
  app.use("/admin-sports-card", adminSportsCard);
  app.use("/admin-questions", adminQuestions);
  // Public routes
  app.use("/public-cards", publicSportsCard);
  // Test Route to be delete in production
  app.use("/test", testUser);
};
