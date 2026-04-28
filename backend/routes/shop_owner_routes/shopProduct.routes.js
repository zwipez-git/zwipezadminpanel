import express from "express";
import {
  addOrUpdateProduct,
  getProducts,
  deleteProduct,
  updateProduct,
} from "../../controllers/shop_owner/shopProduct.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import upload from "../../middlewares/multer.js"; 
const router = express.Router();

/// 🔥 BASE: /devapiService/shop-owner

router.get("/products", authMiddleware, getProducts);
router.post(
  "/products",
  authMiddleware,
  upload.single("image"), // 🔥 MUST be here
  addOrUpdateProduct
);
router.delete("/products/:id", authMiddleware, deleteProduct);
router.put("/products/:id", authMiddleware, updateProduct);
export default router;