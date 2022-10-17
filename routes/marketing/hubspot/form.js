const express = require("express");
const router = express.Router();
const axios = require("axios");
const config = require("config");
const { createResObject } = require("../../../utils/utilFunctions");
const { stringConstants } = require("../../../utils/constants");
const HUBSPOT_TOKEN = config.get(stringConstants.HUBSPOT_TOKEN);

router.post("/hubspot-form-post", async (req, res) => {
  const { portalId, formId, bodyData } = req.body;

  try {
    const { data } = await axios({
      method: "post",
      url: `https://api.hsforms.com/submissions/v3/integration/secure/submit/${portalId}/${formId}`,
      data: bodyData,
      headers: {
        Authorization: `Bearer ${HUBSPOT_TOKEN}`,
      },
    });
    res.status(200).json(data);
    createResObject(true, {
      message: "Done",
    });
  } catch (err) {
    console.log(err.message);
    createResObject(true, {
      message: "Error.",
    });
  }
});

module.exports = router;
