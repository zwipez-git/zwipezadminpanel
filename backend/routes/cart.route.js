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


router.post("/addCart", addCart);

router.get("/getCart", getCart);


router.delete('/cart/remove', removeItem);
router.patch('/cart/remove/singleItem',decreaseItemQuantity)
router.patch('/cart/add/singleItem',increaseItemQuantity)


router.delete("/clear", clearCart);

export default router;
