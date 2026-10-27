import { tool } from "@langchain/core/tools";
import { z } from "zod";

const PRODUCTS_URL = "https://santosnr6.github.io/Data/pixelforgeproducts.json";

const getProducts = async () => {
	const response = await fetch(PRODUCTS_URL);
	return await response.json();
};

const searchProducts = tool(
	async ({ search, category, maxPrice, inStock }) => {
		const products = await getProducts();

		const results = products.filter((product) => {
			const matchesSearch = search
				? product.name.toLowerCase().includes(search.toLowerCase()) ||
					product.brand.toLowerCase().includes(search.toLowerCase())
				: true;

			const matchesCategory = category
				? product.category.toLowerCase() === category.toLowerCase()
				: true;

			const matchesPrice = maxPrice ? product.price <= maxPrice : true;

			const matchesStock = inStock ? product.stock > 0 : true;

			return (
				matchesSearch && matchesCategory && matchesPrice && matchesStock
			);
		});

		if (results.length === 0) {
			return "Hittade inga produkter som matchade sökningen.";
		}

		return JSON.stringify(results.slice(0, 10));
	},
	{
		name: "search_products",
		description:
			"Söker efter produkter i butiken via namn, märke, kategori, maxpris eller lagerstatus.",
		schema: z.object({
			search: z
				.string()
				.optional()
				.describe(
					"Sökord för produktnamn eller märke, t.ex. 'RTX 4080' eller 'Razer'.",
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
				.describe("Produktkategori på engelska."),
			maxPrice: z
				.number()
				.optional()
				.describe("Högsta pris i kronor (t.ex. 2000)."),
			inStock: z
				.boolean()
				.optional()
				.describe("Sätt till true om produkten måste finnas i lager."),
		}),
	},
);

const addToCart = tool(
	async ({ productName }) => {
		const products = await getProducts();

		const product = findProduct(products, productName);

		if (!product) {
			return `Hittade ingen produkt med namnet "${productName}".`;
		}

		if (product.stock === 0) {
			return `Produkten "${product.name}" är tyvärr slut i lager.`;
		}

		return JSON.stringify({
			message: `La till ${product.name} i kundvagnen.`,
			cartAction: {
				type: "add",
				product: product,
			},
		});
	},
	{
		name: "add_to_cart",
		description:
			"Lägger till EN produkt i kundvagnen. Använd när användaren vill köpa eller lägga till något.",
		schema: z.object({
			productName: z
				.string()
				.describe("Namnet på produkten som ska läggas till."),
		}),
	},
);

const removeFromCart = tool(
	async ({ productName }) => {
		const products = await getProducts();

		const product = findProduct(products, productName);

		if (!product) {
			return `Hittade ingen produkt med namnet "${productName}".`;
		}

		return JSON.stringify({
			message: `Tog bort ${product.name} från kundvagnen.`,
			cartAction: {
				type: "remove",
				productId: product.id,
			},
		});
	},
	{
		name: "remove_from_cart",
		description:
			"Tar bort EN specifik produkt från kundvagnen. Töm inte hela kundvagnen med detta verktyg, använd clear_cart för det.",
		schema: z.object({
			productName: z
				.string()
				.describe("Namnet på produkten som ska tas bort."),
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

// had issues with too strict searches, using this instead
const findProduct = (products, name) => {
	const q = name.toLowerCase().trim();
	return (
		products.find((p) => p.name.toLowerCase() === q) ??
		products.find((p) => p.name.toLowerCase().includes(q)) ??
		products.find((p) => q.includes(p.name.toLowerCase()))
	);
};

export const tools = [searchProducts, addToCart, removeFromCart, clearCart];
