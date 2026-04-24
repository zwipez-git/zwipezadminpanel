import express from "express";
import { getShopOrders } from "../../controllers/shop_owner/shopOrder.controller.js";

const router = express.Router();

// router.get("/orders/:shop_id", getShopOrders);
router.get("/orders", getShopOrders);

export default router;