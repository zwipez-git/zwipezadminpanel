import express from "express";
import { chatWithAI } from "../controllers/ai.controller.js";

const router = express.Router();

//  THIS IS IMPORTANT
router.post("/chat", chatWithAI);
router.get("/test", (req, res) => {
  res.send("AI route working");
});
export default router;