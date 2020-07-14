const user = require("../routes/user");
const authenticate = require("../routes/authenticate");
const payment = require("../routes/payment");
const authToken = require("../routes/authToken");
const sportsCard = require("../routes/sportsCard");

module.exports = (app) => {
  // Import route and use app.use();
  app.use("/user", user);
  app.use("/authenticate", authenticate);
  app.use("/payment", payment);
  app.use("/auth-token", authToken);
  app.use("/sports-card", sportsCard);
};
