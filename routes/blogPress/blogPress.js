/**
 * Public card route accesible to general public
 */
const express = require("express");
const router = express.Router();
const authAdmin = require("../../middlewares/authenticateAdmin");
const { BLOG_PRESS } = require("../../models/blogPress");
const { stringConstants } = require("../../utils/constants");
const { createResObject } = require("../../utils/utilFunctions");
const {
  valBlogPress,
  valObjectIdInUrl,
  valBlogPressUpdate,
  valPostTypeInUrl,
} = require("../../middlewares/validation");
const { valPageSizeNumber } = require("../../middlewares/validation");

/**
 * Route to post press and blog
 */
router.post("/", [authAdmin, valBlogPress], async (req, res) => {
  let blogsPress = await BLOG_PRESS.create(req.body);

  return res.send(
    createResObject(
      true,
      { title: blogsPress.title },
      stringConstants.FETCH_SUCESSFUL
    )
  );
});

router.put(
  "/:id",
  [authAdmin, valObjectIdInUrl, valBlogPressUpdate],
  async (req, res) => {
    let blogsPress = await BLOG_PRESS.findOneAndUpdate(
      { _id: req.params.id },
      req.body
    );

    return res.send(
      createResObject(
        true,
        { title: blogsPress.title },
        stringConstants.UPDATE_SUCCESSFUL
      )
    );
  }
);

router.delete("/:id", [authAdmin, valObjectIdInUrl], async (req, res) => {
  let blogsPress = await BLOG_PRESS.deleteOne({ _id: req.params.id });

  return res.send(
    createResObject(
      true,
      { title: blogsPress.title },
      stringConstants.DELETED_SUCCESSFULLY
    )
  );
});

router.get("/:id", [valObjectIdInUrl], async (req, res) => {
  let blogPress = await BLOG_PRESS.findOne({ _id: req.params.id });

  return res.send(
    createResObject(true, { blogPress }, stringConstants.FETCH_SUCESSFUL)
  );
});

router.get("/collection/:type", [valPostTypeInUrl], async (req, res) => {
  let blogs = await BLOG_PRESS.find({ type: req.params.type }).select(
    "title bannerImage type"
  );

  return res.send(
    createResObject(true, { blogs }, stringConstants.FETCH_SUCESSFUL)
  );
});

router.get(
  "/:pageSize/:pageNumber/:type",
  [valPageSizeNumber, valPostTypeInUrl],
  async (req, res) => {
    const pageSize = parseInt(req.params.pageSize);
    const pageNumber = parseInt(req.params.pageNumber);

    const totalDocs = await BLOG_PRESS.count({ type: req.params.type });
    const totalDocuments = await BLOG_PRESS.find({ type: req.params.type })
      .sort({ createdAt: 1 })
      .select("title bannerImage type")
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    return res.send(
      createResObject(
        true,
        {
          blogsPress: totalDocuments,
          totalDocs,
        },
        stringConstants.FETCH_SUCESSFUL
      )
    );
  }
);

module.exports = router;
