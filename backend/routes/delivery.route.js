import express from "express";
import {
  getDeliveryProfile,
  registerDelivery,
  completeDeliveryProfile,
  updateDeliveryProfile,
  saveAadhar,
  getAadhar,
  savePan,
  getPan,
  saveVehicle, 
  saveLicense,
  saveBankDetails,
  saveEmergencyDetails
} from "../controllers/deliveryController.js";

import { authMiddleware } from "../controllers/auth.controller.js";

const router = express.Router();

//  PROFILE
router.get("/profile", authMiddleware(), getDeliveryProfile);

//  REGISTER 
router.post("/register", authMiddleware(), registerDelivery);

//  COMPLETE PROFILE 
router.put("/complete-profile", authMiddleware(), completeDeliveryProfile);

//  UPDATE PROFILE (optional)
router.put("/update-profile", authMiddleware(), updateDeliveryProfile);

//  AADHAR CARD
router.post("/aadhar", authMiddleware(), saveAadhar);
router.get("/aadhar", authMiddleware(), getAadhar);

// PAN CARD
router.post("/pan", authMiddleware(), savePan);
router.get("/pan", authMiddleware(), getPan);

// VEHICLE
router.post("/vehicle", authMiddleware(), saveVehicle);

// LICENSE
router.post("/license", authMiddleware(), saveLicense);

// BANK DETAILS
router.post("/bank-details",authMiddleware(), saveBankDetails);

// Emergency details
router.post("/emergency",authMiddleware(), saveEmergencyDetails);

export default router;