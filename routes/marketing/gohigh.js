const express = require("express");
const router = express.Router();
const axios = require("axios");
const config = require("config");
const { createResObject } = require("../../utils/utilFunctions");
const { errorObjects } = require("../../utils/errorObjects");
const { marketingGoHighVal } = require("../../middlewares/validators/index");
const { stringConstants } = require("../../utils/constants");
const GO_HIGH_API_KEY = config.get(stringConstants.GO_HIGH_API_KEY);

router.post(
  "/main-hero-banner",
  [marketingGoHighVal.valHeroBannerContactInfo],
  async (req, res) => {
    try {
      await axios(getAxiosConfig(req.body, "main-hero-banner"));
      return res.send(
        createResObject(true, {
          //   ...resp.data,
          message: "You're all set. We'll hit you up soon.",
        })
      );
    } catch (error) {
      return res.send(createResObject(false, { error }));
    }
  }
);

router.post(
  "/main-footer",
  [marketingGoHighVal.valFooterContactInfo],
  async (req, res) => {
    try {
      await axios(getAxiosConfig(req.body, "main-footer"));
      return res.send(
        createResObject(true, {
          //   ...resp.data,
          message: "You're all set. We'll hit you up soon.",
        })
      );
    } catch (error) {
      return res.send(createResObject(false, { error }));
    }
  }
);

router.post(
  "/game-over",
  [marketingGoHighVal.valGameOverContactInfo],
  async (req, res) => {
    try {
      await axios(getAxiosConfig(req.body, "game-over"));
      return res.send(
        createResObject(true, {
          //   ...resp.data,
          message: "DOPE YOU'RE ON THE LIST !!!",
        })
      );
    } catch (error) {
      return res.send(createResObject(false, { error }));
    }
  }
);

function getAxiosConfig(body, tag) {
  return {
    method: "post",
    url: "https://rest.gohighlevel.com/v1/contacts/",
    headers: {
      Authorization: `Bearer ${GO_HIGH_API_KEY}`,
    },
    data: {
      ...body,
      tags: [tag],
    },
  };
}

module.exports = router;
