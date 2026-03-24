import express from "express";
import {
 addCoupon,
 getCoupons,
 applyCoupon ,


} from "../controllers/coupon.controller.js";

const router = express.Router();


// add coupon
router.post("/addCoupon", addCoupon);

router.get("/getCoupons", getCoupons);

//  router.put("/update", updateCoupon);


// router.delete("/delete", deleteCoupon);


router.post("/applyCoupon", applyCoupon);


export default router;