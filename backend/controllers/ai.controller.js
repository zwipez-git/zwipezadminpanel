import { handleAIQuery } from "../services/ai.service.js";

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    const result = await handleAIQuery(message);

    console.log("AI RESULT:", result); // 👈 DEBUG

    return res.json(result);
  } catch (error) {
    console.error("AI ERROR:", error);
    return res.status(500).json({ error: "Server error" });
  }
};