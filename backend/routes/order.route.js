import express from "express";
import {
 
  checkout,
  placeOrder,
  getOrders,
getOrderDetailsCustomer ,
getOrderDetailsAdmin

} from "../controllers/order.controller.js";

const router = express.Router();


router.post("/checkout", checkout);
router.post("/placeOrder",placeOrder);
// customer
router.get("/getOrders",getOrders)
router.get("/getOrderDetails/:order_id", getOrderDetailsCustomer );



//admin
router.get("/admin/getOrderDetails/:order_id", getOrderDetailsAdmin);

export default router;