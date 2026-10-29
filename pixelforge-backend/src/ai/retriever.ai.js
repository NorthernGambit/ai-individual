import { embeddingModel } from "../config/ollama.config.js";
import { supabase } from "../config/supabase.config.js";

export const retrieveDocuments = async (question) => {
	console.log("[RAG] Standalone question:", question);
	const embedding = await embeddingModel.embedQuery(question);

	const { data, error } = await supabase.rpc("match_documents", {
		query_embedding: embedding,
		match_count: 3,
	});

	if (error) {
		console.error("[RAG] Supabase error:", error.message);
		throw error;
	}

	const sources = data.map(
		(doc) => `${doc.metadata?.source} (${doc.similarity.toFixed(2)})`,
	);
	console.log("[RAG] Matched docs:", sources.join(", ") || "None");

	return data;
};
