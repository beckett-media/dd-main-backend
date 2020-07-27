const user = require("../routes/user/user");
const authenticate = require("../routes/user/authenticate");
const payment = require("../routes/user/payment");
const authToken = require("../routes/common/authToken");
const sportsCard = require("../routes/user/sportsCard");
const ebay = require("../routes/user/ebay");
const adminAuth = require("../routes/admin/authenticate");
const adminSportsCard = require("../routes/admin/sportsCard");
const pay = require("../routes/user/pay");
const notificaiton = require("../routes/user/testNotifications");

module.exports = (app) => {
  // Import route and use app.use();
  app.use("/user", user);
  app.use("/authenticate", authenticate);
  app.use("/payment", payment);
  app.use("/auth-token", authToken);
  app.use("/sports-card", sportsCard);
  app.use("/ebay", ebay);
  app.use("/admin-auth", adminAuth);
  app.use("/admin-sports-card", adminSportsCard);
  app.use("/pay", pay);
  // Test notificaiton route
  app.use("/notification", notificaiton);
};
