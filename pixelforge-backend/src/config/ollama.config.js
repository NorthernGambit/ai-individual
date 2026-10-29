import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import "dotenv/config";

export const llm = new ChatOllama({
	model: process.env.OLLAMA_LLM,
	temperature: 0.2,
	numCtx: 8192,
});

export const fastLlm = new ChatOllama({
	model: process.env.OLLAMA_LLM,
	temperature: 0.2,
	think: false,
	numCtx: 8192,
});

export const embeddingModel = new OllamaEmbeddings({
	model: process.env.OLLAMA_EMBEDDING_MODEL,
	baseUrl: "http://localhost:11434",
});
