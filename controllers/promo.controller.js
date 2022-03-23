const { stringConstants } = require("../utils/constants");
const { createResObject } = require("../utils/utilFunctions");
const { promoService } = require("../services");
const { errorObjects } = require("../utils/errorObjects");
const SimpleLogger = require("../utils/simpleLogger");
const createPromo = async (req, res) => {
  try {
    const promo = await promoService.createPromo(req.body);
    if (promo)
      res.status(201).send(
        createResObject(
          true,
          {
            promo,
          },
          "Promo created successfully"
        )
      );
    else {
      SimpleLogger(err);
      res
        .status(400)
        .send(
          createResObject(
            false,
            {},
            stringConstants.PROMO_CODE_ALREADY_EXISTS,
            errorObjects.PROMO_CODE_ALREADY_EXISTS
          )
        );
    }
  } catch (err) {
    SimpleLogger(err);
    res
      .status(400)
      .send(
        createResObject(
          false,
          {},
          stringConstants.PROMO_CODE_ALREADY_EXISTS,
          errorObjects.PROMO_CODE_ALREADY_EXISTS
        )
      );
  }
};

const getPromos = async (req, res) => {
  try {
    const { role } = req.user;
    const promos = await promoService.getPromos(role);
    res
      .status(200)
      .send(createResObject(true, { promos }, stringConstants.FETCH_SUCESSFUL));
  } catch (err) {
    SimpleLogger(err);
    res
      .status(400)
      .send(
        createResObject(
          false,
          { error: err },
          "Promos not fetched successfully"
        )
      );
  }
};

const getPromo = async (req, res) => {
  try {
    const promo = await promoService.getPromoById(req.params.promoId);
    res
      .status(200)
      .send(createResObject(true, { promo }, stringConstants.FETCH_SUCESSFUL));
  } catch (err) {
    res
      .status(400)
      .send(
        createResObject(
          false,
          {},
          stringConstants.PROMO_NOT_FOUND,
          errorObjects.PROMO_NOT_FOUND
        )
      );
  }
};
const updatePromo = async (req, res) => {
  try {
    const promo = await promoService.updatePromoById(
      req.params.promoId,
      req.body
    );
    res
      .status(200)
      .send(createResObject(true, { promo }, stringConstants.FETCH_SUCESSFUL));
  } catch (err) {
    res
      .status(400)
      .send(
        createResObject(
          false,
          {},
          stringConstants.PROMO_NOT_FOUND,
          errorObjects.PROMO_NOT_FOUND
        )
      );
  }
};

const deletePromo = async (req, res) => {
  try {
    const promo = await promoService.softDeletepromoById(req.params.promoId);
    res.send(
      createResObject(true, { promo }, stringConstants.DELETED_SUCCESSFULLY)
    );
  } catch (err) {
    SimpleLogger(err);
    res
      .status(400)
      .send(
        createResObject(
          false,
          {},
          stringConstants.PROMO_NOT_FOUND,
          errorObjects.PROMO_NOT_FOUND
        )
      );
  }
};

const validatePromo = async (req, res) => {
  try {
    const promo = await promoService.validatePromo(req.body.promoCode);
    res.send(createResObject(true, { promo }, stringConstants.PROMO_VALIDATED));
  } catch (err) {
    SimpleLogger(err);
    res
      .status(400)
      .send(
        createResObject(
          false,
          {},
          stringConstants.PROMO_NOT_VALIDATED,
          errorObjects.PROMO_NOT_VALIDATED
        )
      );
  }
};

module.exports = {
  createPromo,
  getPromos,
  updatePromo,
  deletePromo,
  getPromo,
  validatePromo,
};
