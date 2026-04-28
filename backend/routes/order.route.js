import express from "express";
import {
 
  checkout,
  placeOrder,
  getOrders,
getOrderDetailsCustomer ,
getOrderDetailsAdmin,
updateOrderStatus

} from "../controllers/order.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();


router.post("/checkout", checkout);
router.post("/placeOrder",placeOrder);
// customer
router.get("/getOrders",getOrders)
router.get("/getOrderDetails/:order_id", getOrderDetailsCustomer );
// router.post("/update-order-status", updateOrderStatus);
router.post("/update-order-status", authMiddleware, updateOrderStatus);


//admin
router.get("/admin/getOrderDetails/:order_id", getOrderDetailsAdmin);

export default router;