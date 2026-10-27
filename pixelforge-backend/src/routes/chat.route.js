import { Router } from "express";
import { invokeAssistant } from "../ai/assistant.ai.js";

const router = Router();

router.post("/", async (req, res) => {
	try {
		const { question, history = [] } = req.body;
		console.log("Received question:", question);

		const response = await invokeAssistant(question, history);

		res.json({ answer: response.content });
	} catch (error) {
		console.error("Chat error:", error);
		res.status(500).json({ error: error.message });
	}
});

export default router;
