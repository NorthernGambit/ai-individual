export const combineDocuments = (documents) => {
	return documents
		.map((document) => {
			const content = document.content || document.pageContent || "";
			const source = document.metadata?.source || "";

			// omvandlar t.ex. "doc-001_shipping-information.pdf" till "shipping-information"
			const slug = source.replace(/^doc-\d+_/, "").replace(/\.pdf$/i, "");

			if (slug) {
				return `Källa: /support/${slug}\n${content}`;
			}

			return content;
		})
		.join("\n\n");
};
