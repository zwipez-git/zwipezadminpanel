import express from "express";
import {
    addBannerImage,
  getBannerImages,updateBannerImage,deleteBannerImage
} from "../controllers/banner.controller.js";

const router = express.Router();

router.post("/banners",addBannerImage );
router.get("/get-banners", getBannerImages);
router.put("/banners/:id", updateBannerImage);
router.delete("/banners/:id", deleteBannerImage);


export default router;

