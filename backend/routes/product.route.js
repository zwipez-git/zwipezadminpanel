import express from "express";
import {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct
} from "../controllers/product.controller.js";

const router = express.Router();

router.post("/products", addProduct);
router.get("/get-products", getProducts);
router.delete("/products/:id", deleteProduct);
router.put("/products/:id", updateProduct);

export default router;
