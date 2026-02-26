import express from "express";
import {
  sendOtp,
  verifyOtp,
  refreshToken,
  getOtpList,
  getAllRefreshTokens
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/refresh-token", refreshToken);


router.get("/getOtpList", getOtpList);

router.get("/all-refresh-tokens", getAllRefreshTokens);

export default router;
