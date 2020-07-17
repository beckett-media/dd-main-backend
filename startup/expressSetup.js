const express = require("express");
const helmet = require("helmet");
const path = require("path");
const compression = require("compression");
const useragent = require("express-useragent");
const appToken = require("../middlewares/appAuth");
const simpleLoggerMid = require("../middlewares/simpleLogger");

module.exports = (app) => {
  app.use(helmet());
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));
  app.use(useragent.express());
  /**
   * Simple logger middelware to log requests
   * Not used in production as it pollutes the logs
   */

  app.use(simpleLoggerMid);
};
