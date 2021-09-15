/**
 * Public card route accesible to general public
 */
 const express = require("express");
 const router = express.Router();
 const { Store } = require("../../models/store");
 const { stringConstants } = require("../../utils/constants");
 const { createResObject } = require("../../utils/utilFunctions");
 const { errorObjects } = require("../../utils/errorObjects");
 
 /**
  * Route to get all card stores
  */
 router.get("/", async (req, res) => {
     let stores = await Store.find();
 
     if (!stores)
         return res
             .status(404)
             .send(
                 createResObject(
                     false,
                     {},
                     stringConstants.STORE_NOT_FOUND,
                     errorObjects.PRODUCT_ID_NOT_FOUND
                 )
             );
 
     return res.send(
         createResObject(true, { stores }, stringConstants.FETCH_SUCESSFUL)
     );
 });
 module.exports = router;
 