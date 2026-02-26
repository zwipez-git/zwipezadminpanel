import express from "express";
import {
  UserProfile,
  authenticateUser,
  getUsersList,
  updateCustomer,
  deleteCustomer
} from "../controllers/customers.controller.js";

const router = express.Router();

router.post("/profile", authenticateUser, UserProfile);
router.get("/profile", getUsersList);
router.put("/profile/:phone", updateCustomer);
router.delete("/profile/:phone", deleteCustomer);

export default router;
