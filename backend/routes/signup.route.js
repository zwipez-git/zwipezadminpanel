import express from "express";
import {
  signup,
  getAdminsList,
  updateUser,
  deleteUser,
} from "../controllers/signup.controller.js";

const router = express.Router();

router.post("/", signup);
router.get("/getAdminsList", getAdminsList);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;


