// import express from "express";
// import { registerShop, getShop } from "../../controllers/shop_owner/shop.controller.js";

// const router = express.Router();

// router.post("/shop/register", registerShop);
// router.get("/shop/:phone", getShop);

// export default router;

import express from "express";
import {
  registerShop,
  getShop,
  checkShopExists,
  getMyShop,
  toggleShopActive,
  getAllShops,
  getAllShopsWithProducts

} from "../../controllers/shop_owner/shop.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const router = express.Router();

// /api/shops/register
router.post("/register", registerShop);

// ✅ CHECK FIRST
router.get("/check/:phone", checkShopExists);

//  ADD THIS (VERY IMPORTANT)
router.get("/me", authMiddleware, getMyShop);
router.put("/toggle-active", authMiddleware, toggleShopActive);
// /api/shops/:phone (KEEP LAST)

router.get("/", getAllShops);
router.get("/with-products", getAllShopsWithProducts);
router.get("/:phone", getShop);
export default router;