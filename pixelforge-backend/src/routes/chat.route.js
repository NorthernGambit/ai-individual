import { Router } from "express";
import { chain, llmRoutingChain } from "../ai/chains.ai.js";
import { invokeAssistant } from "../ai/assistant.ai.js";

const router = Router();

router.post("/", async (req, res) => {
	try {
		const { question, history = [], cart = [] } = req.body;
		console.log("\n--- New Request ---");
		console.log("[CHAT] Question:", question);
		console.log(
			`[CHAT] History: ${history.length} msgs | Cart: ${cart.length} items`,
		);

		const { route } = await llmRoutingChain.invoke({
			history,
			question,
		});

		console.log("[ROUTER] Selected route:", route);

		let answer = "";
		let cartActions = [];

		if (route === "rag") {
			answer = await chain.invoke({
				history,
				question,
			});
		} else {
			const response = await invokeAssistant(question, history, cart);
			answer = response.content;
			cartActions = response.cartActions || [];
		}

		if (cartActions.length > 0) {
			console.log("[CHAT] Cart actions:", JSON.stringify(cartActions));
		}

		console.log("[CHAT] Response sent");

		res.json({ answer, cartActions });
	} catch (error) {
		console.error("[ERROR] Chat route:", error.message);
		res.status(500).json({ error: error.message });
	}
});

export default router;
