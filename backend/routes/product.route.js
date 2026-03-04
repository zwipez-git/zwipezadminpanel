import express from "express";
import {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct,
  getProductsByCategory
} from "../controllers/product.controller.js";
const router = express.Router();

router.post("/products", addProduct);
router.get("/get-products", getProducts);
router.get("/products/category/:id", getProductsByCategory);
router.delete("/products/:id", deleteProduct);
router.put("/products/:id", updateProduct);

export default router;
