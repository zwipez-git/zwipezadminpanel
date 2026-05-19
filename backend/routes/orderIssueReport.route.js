import express from "express";
import { authMiddleware } from "../controllers/auth.controller.js";
import upload from "../middlewares/multer.js";
import { createOrderIssueReport } from "../controllers/orderIssueReport.controller.js";

const router = express.Router();

// POST /api/order-issue-reports
// multipart/form-data:
// - image (file)
// - shop_id
// - delivery_partner_id (or deliveryboy_id)
// - customer_id
// - order_id
// - product_id
// - reason
router.post(
  "/order-issue-reports",
  authMiddleware(),
  upload.single("image"),
  createOrderIssueReport
);

export default router;

