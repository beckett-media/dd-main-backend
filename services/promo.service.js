const { Promo } = require("../models/promo.model");
/**
 * Create a promo
 * @param {Object} promoBody
 * @returns {Promise<promo>}
 */
const createPromo = async (promoBody) => {
  const promo = await Promo.create(promoBody);
  return promo;
};

const getPromos = async () => {
  const promos = await Promo.find({ enabled: true, isDeleted: false });
  return promos;
};

/**
 * Get promo by id
 * @param {ObjectId} id
 * @returns {Promise<promo>}
 */
const getPromoById = async (promoId) => {
  const promo = await Promo.findById(promoId);
  if (promo?.isDeleted === true) throw new Error("Promo not found");
  return promo;
};

/**
 * Update promo by id
 * @param {ObjectId} promoId
 * @param {Object} updateBody
 * @returns {Promise<promo>}
 */
const updatePromoById = async (promoId, updateBody) => {
  const promo = await getPromoById(promoId);
  if (!promo) {
    throw new Error("Promo not found");
  }
  Object.assign(promo, updateBody);
  await promo.save();
  return promo;
};

/**
 * softDelete promo by id
 * @param {ObjectId} promoId
 * @returns {Promise<promo>}
 */
const softDeletepromoById = async (promoId) => {
  const promo = await getPromoById(promoId);
  if (!promo) {
    throw new Error("Promo not found");
  }
  promo.isDeleted = true;
  await promo.save();
  return promo;
};

module.exports = {
  createPromo,
  getPromos,
  updatePromoById,
  softDeletepromoById,
  getPromoById,
};
