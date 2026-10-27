import { StringOutputParser } from "@langchain/core/output_parsers";
import {
	RunnableSequence,
	RunnablePassthrough,
} from "@langchain/core/runnables";
import {
	standaloneQuestionPrompt,
	answerPrompt,
	routingPrompt,
} from "./prompts.ai.js";
import { llm } from "../config/ollama.config.js";
import { retrieveDocuments } from "./retriever.ai.js";
import { combineDocuments } from "../utils/combineDocuments.js";
import { routingSchema } from "./schemas.ai.js";

export const llmRoutingChain = RunnableSequence.from([
	routingPrompt,
	llm.withStructuredOutput(routingSchema),
]);

const standaloneQuestionChain = RunnableSequence.from([
	standaloneQuestionPrompt,
	llm,
	new StringOutputParser(),
]);

const retrieverChain = RunnableSequence.from([
	(data) => data.standaloneQuestion,
	retrieveDocuments,
	combineDocuments,
]);

const answerChain = RunnableSequence.from([
	answerPrompt,
	llm,
	new StringOutputParser(),
]);

export const chain = RunnableSequence.from([
	{
		standaloneQuestion: standaloneQuestionChain,
		originalQuestion: new RunnablePassthrough(),
	},
	{
		context: retrieverChain,
		question: ({ originalQuestion }) => originalQuestion.question,
		history: ({ originalQuestion }) => originalQuestion.history,
	},
	answerChain,
]);
