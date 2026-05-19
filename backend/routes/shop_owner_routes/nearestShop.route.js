import express from "express";
import {
  getAllShops,
  getNearestShop,
  getNearestShopProducts,
} from "../../controllers/shop_owner/nearestShop.controller.js";

const router = express.Router();

/**
 * @route   GET /api/shops-mongo
 * @desc    Get all shops in the system with their nested products
 * @access  Public
 */
router.get("/", getAllShops);

/**
 * @route   GET /api/shops-mongo/nearest
 * @desc    Get nearest shop based on user lat & lng query parameters
 * @access  Public
 */
router.get("/nearest", getNearestShop);

/**
 * @route   GET /api/shops-mongo/nearest/products
 * @desc    Get products from the nearest shop based on user lat & lng query parameters
 * @access  Public
 */
router.get("/nearest/products", getNearestShopProducts);

export default router;
