import express from "express";
import { authMiddleware } from "../../controllers/auth.controller.js";
import {
  acceptShopOrder,
  getShopOrders,
  rejectShopOrder,
  markShopOrderReadyForPickup,
  getShopEarnings,
} from "../../controllers/shop_owner/shopOrder.controller.js";
import {
  createOrRefreshPickupOtp,
  getPickupOtpStatus,
  verifyPickupOtpAndMarkPickedUp,
} from "../../controllers/shop_owner/shopPickup.controller.js";

const router = express.Router();

// router.get("/orders/:shop_id", getShopOrders);
router.get("/orders", getShopOrders);
router.get(
  "/earnings",
  authMiddleware(),
  getShopEarnings
);
router.patch("/orders/:order_id/accept", acceptShopOrder);
router.patch("/orders/:order_id/reject", rejectShopOrder);

router.patch("/orders/:order_id/ready-for-pickup", markShopOrderReadyForPickup);
router.post("/orders/:order_id/pickup-otp", createOrRefreshPickupOtp);
router.get("/orders/:order_id/pickup-otp-status", getPickupOtpStatus);
router.patch("/orders/:order_id/mark-picked-up", verifyPickupOtpAndMarkPickedUp);

export default router;