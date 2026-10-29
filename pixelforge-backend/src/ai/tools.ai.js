import { tool } from "@langchain/core/tools";
import { z } from "zod";

const PRODUCTS_URL = "https://santosnr6.github.io/Data/pixelforgeproducts.json";

const getProducts = async () => {
	const response = await fetch(PRODUCTS_URL);
	return await response.json();
};

// came up with this solution with help of ai
const searchProducts = tool(
	async ({ search, category, minPrice, maxPrice, inStock }) => {
		const products = await getProducts();

		// makes the llm's search text into an array of strings split with space
		const searchWords = search
			? search.toLowerCase().trim().split(/\s+/)
			: [];
		// if all matches return true then a product is returned
		const results = products.filter((product) => {
			// combining the searchable values in to one string to simplify the search
			const searchableText =
				`${product.name} ${product.brand} ${product.category}`.toLowerCase();

			// check that every search word appears somewhere in the text. returns true if all words matches. Also returns true if searchwords array is empty.
			const matchesSearch = searchWords.every((word) =>
				searchableText.includes(word),
			);

			// passes / returns true if cateogory is ommited or mathes exactly
			const matchesCategory =
				!category ||
				product.category.toLowerCase() === category.toLowerCase();

			// if no min or max price is given it returns true and passes, if a min or max is given it does the price check.
			const matchesPrice =
				(minPrice === undefined || product.price >= minPrice) &&
				(maxPrice === undefined || product.price <= maxPrice);

			const matchesStock = !inStock || product.stock > 0;

			// the product is kept only if all four checks passed.
			return (
				matchesSearch && matchesCategory && matchesPrice && matchesStock
			);
		});

		if (results.length === 0) {
			return "Hittade inga produkter som matchade sökningen.";
		}

		console.log(
			`[TOOL:search_products] Matched ${results.length} products`,
		);
		return JSON.stringify(results.slice(0, 20));
	},
	{
		name: "search_products",
		description:
			"Searches the store's products by name, brand, or category, with optional filters for category, price range, and stock. Product names and categories are in English, so translate Swedish search words to English (for example, 'tangentbord' becomes 'keyboard'). Always set search when the user names a brand or product. Only use price filters when the user mentions a price. Returns at most 20 matching products.",
		schema: z.object({
			search: z
				.string()
				.optional()
				.describe(
					"Product name, brand, or category keyword in English, for example 'Corsair' for all Corsair products or 'RTX 4080' for one product. Always set this when the user names a brand or product.",
				),
			category: z
				.enum([
					"Gaming PCs",
					"Graphics Cards",
					"Processors",
					"Monitors",
					"Keyboards",
					"Mice",
					"Headsets",
					"Motherboards",
					"Memory",
					"Storage",
				])
				.optional()
				.describe(
					"Product category. Use only when the user asks for a specific category.",
				),
			minPrice: z
				.number()
				.optional()
				.describe(
					"Lowest price in SEK (for example 5000). Only use when the user mentions a minimum price.",
				),
			maxPrice: z
				.number()
				.optional()
				.describe(
					"Highest price in SEK (for example 2000). Only use when the user mentions a maximum price.",
				),
			inStock: z
				.boolean()
				.optional()
				.describe(
					"Set to true only when the user asks for products that are in stock.",
				),
		}),
	},
);

const addToCart = tool(
	async ({ productName, qty = 1 }) => {
		const products = await getProducts();

		const product = findProduct(products, productName);

		if (!product) {
			return `Hittade ingen produkt med namnet "${productName}".`;
		}

		if (product.stock === 0) {
			return `Produkten "${product.name}" är tyvärr slut i lager.`;
		}

		if (qty > product.stock) {
			return `Vi har bara ${product.stock} st av "${product.name}" i lager.`;
		}

		const formattedProduct = {
			id: product.id,
			name: product.name,
			price: product.price,
			image: product.image,
		};

		return JSON.stringify({
			message: `La till ${product.name} i kundvagnen.`,
			cartAction: {
				type: "add",
				product: formattedProduct,
				qty,
			},
		});
	},
	{
		name: "add_to_cart",
		description:
			"Lägger till antalet produkter i kundvagnen. Använd när användaren vill köpa eller lägga till något.",
		schema: z.object({
			productName: z
				.string()
				.describe("Namnet på produkten som ska läggas till."),
			qty: z
				.number()
				.int()
				.min(1)
				.optional()
				.describe(
					"Antal att lägga till. Utelämna om användaren inte säger något.",
				),
		}),
	},
);

const subtractFromCart = tool(
	async ({ productName, qty = 1 }) => {
		const products = await getProducts();

		const product = findProduct(products, productName);

		if (!product) {
			return `Hittade ingen produkt med namnet "${productName}".`;
		}

		return JSON.stringify({
			message: `Tog bort ${product.name} från kundvagnen.`,
			cartAction: {
				type: "subtract",
				productId: product.id,
				qty,
			},
		});
	},
	{
		name: "subtract_from_cart",
		description:
			"Reducerar antalet av en produkt. Töm inte hela kundvagnen med detta verktyg, använd clear_cart för det.",
		schema: z.object({
			productName: z
				.string()
				.describe("Namnet på produkten som ska tas bort."),
			qty: z
				.number()
				.int()
				.min(1)
				.optional()
				.describe(
					"Antal att ta bort. Utelämna om användaren inte säger något.",
				),
		}),
	},
);

const clearCart = tool(
	async () => {
		return JSON.stringify({
			message: "Kundvagnen har tömts.",
			cartAction: {
				type: "clear",
			},
		});
	},
	{
		name: "clear_cart",
		description:
			"Tömmer hela kundvagnen. Används endast när användaren vill ta bort alla produkter.",
		schema: z.object({}),
	},
);

const findProduct = (products, name) => {
	const q = name.toLowerCase().trim();
	return (
		// precise name match first
		products.find((p) => p.name.toLowerCase() === q) ??
		// then if llm doesnt use the full name I use includes
		products.find((p) => p.name.toLowerCase().includes(q)) ??
		products.find((p) => q.includes(p.name.toLowerCase()))
	);
};

export const tools = [searchProducts, addToCart, subtractFromCart, clearCart];
