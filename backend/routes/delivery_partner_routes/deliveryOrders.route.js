import express from "express";
import { getShopAcceptedOrders } from "../../controllers/delivery_partner/deliveryOrder.controller.js";
import { authMiddleware } from "../../controllers/auth.controller.js";

const router = express.Router();

router.get("/orders", authMiddleware(), getShopAcceptedOrders);

export default router;
