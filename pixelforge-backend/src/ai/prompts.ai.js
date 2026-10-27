import {
	ChatPromptTemplate,
	MessagesPlaceholder,
} from "@langchain/core/prompts";

export const assistantPrompt = ChatPromptTemplate.fromMessages([
	[
		"system",
		`Du är en hjälpsam AI-kundtjänstassistent för teknikbutiken PixelForge.
        Svara alltid på svenska, tydligt och trevligt.`,
	],
	new MessagesPlaceholder("history"),
	["human", "{question}"],
]);
