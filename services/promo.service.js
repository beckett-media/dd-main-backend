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

const getPromos = async (role) => {
  if (role === "admin") {
    const promos = await Promo.find({ isDeleted: false });
    return promos;
  }
  const promos = await Promo.find({ isEnabled: true, isDeleted: false });
  return promos;
};

/**
 * Get promo by id
 * @param {ObjectId} id
 * @returns {Promise<promo>}
 */
const getPromoById = async (promoId) => {
  const promo = await Promo.findById(promoId);
  if (promo && promo.isDeleted === true) throw new Error("Promo not found");
  return promo;
};

const getPromoByPromoCode = async (promoCode) => {
  const promo = await Promo.findOne({ promoCode });
  if (!promo || promo.isDeleted) {
    throw new Error("Promo not found");
  }
  if (promo.isEnabled === true) return promo;
  else throw new Error("Promo not validated");
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
  promo.isEnabled = false;
  await promo.save();
  return promo;
};

/**
 * validate promo by id
 * @param {ObjectId} promoCode
 * @returns {Promise<promo>}
 */
const validatePromo = async (promoCode) => {
  const promo = await Promo.findOne({ promoCode });
  if (!promo || promo.isDeleted) {
    throw new Error("Promo not found");
  }
  if (promo.isEnabled === true) return promo;
  else throw new Error("Promo not validated");
};

const getDiscountedAmount = (totalAmount, discount_percentage) => {
  const discountAmount = totalAmount * (discount_percentage / 100);
  return totalAmount - discountAmount;
};

module.exports = {
  createPromo,
  getPromos,
  updatePromoById,
  softDeletepromoById,
  getPromoById,
  validatePromo,
  getPromoByPromoCode,
  getDiscountedAmount,
};
