import express from "express";
import {
  addOfferProduct,
  getMegaOffers,
 updateOfferProduct,
 deleteOfferProduct 
} from "../controllers/megaoffer.contoller.js";

const router = express.Router();
router.post("/megaoffers", addOfferProduct);
router.get("/megaoffers", getMegaOffers);
router.put("/megaoffers/:id", updateOfferProduct);
router.delete("/megaoffers/:id", deleteOfferProduct);


export default router;
