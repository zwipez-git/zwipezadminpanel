import express from "express";
import {
  UserProfile,
  authenticateUser,
  getUsersList,
  updateCustomer,
  deleteCustomer
} from "../controllers/customers.controller.js";

const router = express.Router();

router.post("/profile", authenticateUser, UserProfile); // mobile apis
router.get("/profile",authenticateUser, getUsersList);
router.put("/profile/:phone", updateCustomer);
router.delete("/profile/:phone", deleteCustomer);

export default router;
