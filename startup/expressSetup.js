const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const useragent = require("express-useragent");
const path = require("path");
const simpleLoggerMid = require("../middlewares/simpleLogger");
const { globalLimiter } = require("../middlewares/rateLimiter");

module.exports = (app) => {
  const viewPath = path.join(__dirname, "../views");
  // Since applicatio runs behind proxy server
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));
  app.set("view engine", "ejs");
  app.set("views", viewPath);
  app.use(useragent.express());
  app.use(globalLimiter);
  /**
   * Simple logger middelware to log requests
   * Not used in production as it pollutes the logs
   */
  app.use(simpleLoggerMid);
};
