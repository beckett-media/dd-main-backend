const user = require("../routes/user");
const authenticate = require("../routes/authenticate");
const payment = require("../routes/payments");
const authToken = require("../routes/authToken");

module.exports = (app) => {
  // Import route and use app.use();
  app.use("/user", user);
  app.use("/authenticate", authenticate);
  app.use("/payment", payment);
  app.use("/auth-token", authToken);
};
