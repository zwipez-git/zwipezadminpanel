import express from "express";
import {
  addCategory,
  getCategories,
  deleteCategory,
  updateCategory
} from "../controllers/category.controller.js";

const router = express.Router();

router.post("/categories", addCategory);
router.get("/get-categories", getCategories);
router.delete("/categories/:id", deleteCategory);
router.put("/categories/:id", updateCategory);

export default router;

