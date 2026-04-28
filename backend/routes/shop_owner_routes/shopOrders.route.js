import express from "express";
import {
  acceptShopOrder,
  getShopOrders,
  rejectShopOrder,
  markShopOrderReadyForPickup,
} from "../../controllers/shop_owner/shopOrder.controller.js";

const router = express.Router();

// router.get("/orders/:shop_id", getShopOrders);
router.get("/orders", getShopOrders);
router.patch("/orders/:order_id/accept", acceptShopOrder);
router.patch("/orders/:order_id/reject", rejectShopOrder);
router.patch("/orders/:order_id/ready-for-pickup", markShopOrderReadyForPickup);

export default router;