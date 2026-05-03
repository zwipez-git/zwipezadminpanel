import express from "express";
import {
  getShopAcceptedOrders,
  acceptDeliveryPartnerOrder,
} from "../../controllers/delivery_partner/deliveryOrder.controller.js";
import { authMiddleware } from "../../controllers/auth.controller.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "delivery route working"
  });
});

router.get(
  "/orders",
  authMiddleware(),
  getShopAcceptedOrders
);

router.post(
  "/orders/accept",
  authMiddleware(),
  acceptDeliveryPartnerOrder
);

export default router;