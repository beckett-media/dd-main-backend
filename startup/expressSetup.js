const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const useragent = require("express-useragent");
const appToken = require("../middlewares/appAuth");
const path = require("path");
const simpleLoggerMid = require("../middlewares/simpleLogger");

module.exports = (app) => {
  const viewPath = path.join(__dirname, "../views");
  app.use(helmet());
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));
  app.set("view engine", "ejs");
  app.set("views", viewPath);
  app.use(useragent.express());
  /**
   * Simple logger middelware to log requests
   * Not used in production as it pollutes the logs
   */
  app.use(simpleLoggerMid);
};
