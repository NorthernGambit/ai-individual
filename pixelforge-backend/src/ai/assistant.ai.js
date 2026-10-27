import { tools } from "./tools.ai.js";
import { llm } from "../config/ollama.config.js";
import { ToolMessage } from "@langchain/core/messages";
import { assistantPrompt } from "./prompts.ai.js";

const llmWithTools = llm.bindTools(tools);

export const invokeAssistant = async (question, history) => {
	const messages = await assistantPrompt.formatMessages({
		question,
		history,
	});

	const response = await llmWithTools.invoke(messages);

	if (!response.tool_calls?.length) {
		return {
			content: response.content,
			cartActions: [],
		};
	}

	const toolMessages = [];
	const cartActions = [];

	for (const toolCall of response.tool_calls) {
		const selectedTool = tools.find((tool) => tool.name === toolCall.name);

		if (!selectedTool) {
			throw new Error(`Unknown tool: ${toolCall.name}`);
		}

		const result = await selectedTool.invoke(toolCall.args);

		try {
			const parsed = JSON.parse(result);
			if (parsed.cartAction) {
				cartActions.push(parsed.cartAction);
			}
		} catch {}

		toolMessages.push(
			new ToolMessage({
				content: result,
				tool_call_id: toolCall.id,
			}),
		);
	}

	const finalResponse = await llmWithTools.invoke([
		...messages,
		response,
		...toolMessages,
	]);

	return {
		content: finalResponse.content,
		cartActions,
	};
};
