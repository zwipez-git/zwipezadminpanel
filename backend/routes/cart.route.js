import express from "express";
import {
  addToCart,
  getCart,
  removeItem,
  clearCart
} from "../controllers/cart.controller.js";

const router = express.Router();


router.post("/addCart", addToCart);

router.get("/getCart", getCart);


router.delete('/cart/remove', removeItem);


router.delete("/clear", clearCart);

export default router;
