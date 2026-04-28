import express from "express";
import {
  addCart,
  getCart,
  removeItem,
  clearCart,
  decreaseItemQuantity,
  increaseItemQuantity
} from "../controllers/cart.controller.js";

const router = express.Router();


// router.post("/addCart", addCart);

// router.get("/getCart", getCart);


// router.delete('/cart/remove', removeItem);
// router.patch('/cart/remove/singleItem',decreaseItemQuantity)
// router.patch('/cart/add/singleItem',increaseItemQuantity)


// router.delete("/clear", clearCart);
router.post("/cart/add", addCart);
router.get("/cart", getCart);
router.delete("/cart/remove", removeItem);
router.patch("/cart/decrease", decreaseItemQuantity);
router.patch("/cart/increase", increaseItemQuantity);
router.delete("/cart/clear", clearCart);

export default router;
