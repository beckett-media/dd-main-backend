const { stringConstants } = require("../utils/constants");
const { createResObject } = require("../utils/utilFunctions");
const { promoService } = require("../services");
const { errorObjects } = require("../utils/errorObjects");
const createPromo = async (req, res) => {
  try {
    const promo = await promoService.createPromo(req.body);
    if (promo)
      res.status(201).send(
        createResObject(
          true,
          {
            promo: {
              name: promo.name,
              promoCode: promo.promoCode,
              percentage: promo.percentage,
              listing: promo.listing,
            },
          },
          "Promo created successfully"
        )
      );
    else
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
  } catch (err) {
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
    const promos = await promoService.getPromos();
    res
      .status(200)
      .send(createResObject(true, { promos }, stringConstants.FETCH_SUCESSFUL));
  } catch (err) {
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

module.exports = {
  createPromo,
  getPromos,
  updatePromo,
  deletePromo,
  getPromo,
};
