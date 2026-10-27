import { Router } from "express";
import { chain, llmRoutingChain } from "../ai/chains.ai.js";
import { invokeAssistant } from "../ai/assistant.ai.js";

const router = Router();

router.post("/", async (req, res) => {
	try {
		const { question, history = [] } = req.body;
		console.log("Received question:", question);

		const { route } = await llmRoutingChain.invoke({
			history,
			question,
		});

		console.log("ROUTE:", route);

		let answer = "";
		let cartActions = [];

		if (route === "rag") {
			answer = await chain.invoke({
				history,
				question,
			});
		} else {
			const response = await invokeAssistant(question, history);
			answer = response.content;
			cartActions = response.cartActions || [];
		}

		console.log("ANSWER:", answer);

		res.json({ answer, cartActions });
	} catch (error) {
		console.error("Chat error:", error);
		res.status(500).json({ error: error.message });
	}
});

export default router;
