import { llm } from "../config/ollama.config.js";
import { assistantPrompt } from "./prompts.ai.js";

export const invokeAssistant = async (question, history) => {
	const messages = await assistantPrompt.formatMessages({
		question,
		history,
	});

	return await llm.invoke(messages);
};
