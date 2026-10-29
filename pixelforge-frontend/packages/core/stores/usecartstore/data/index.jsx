import { create } from "zustand";

export const useCartStore = create((set) => ({
	cart: [],

	addToCart: (product, qty = 1) =>
		set((state) => {
			const existing = state.cart.find(
				(item) => item.productId === product.id,
			);

			if (existing) {
				return {
					cart: state.cart.map((item) =>
						item.productId === product.id
							? { ...item, qty: item.qty + qty }
							: item,
					),
				};
			}

			return {
				cart: [
					...state.cart,
					{
						productId: product.id,
						name: product.name,
						price: product.price,
						image: product.image,
						qty,
					},
				],
			};
		}),

	removeFromCart: (productId, qty = 1) =>
		set((state) => ({
			cart: state.cart
				.map((item) =>
					item.productId === productId
						? { ...item, qty: item.qty - qty }
						: item,
				)
				.filter((item) => item.qty > 0),
		})),

	clearCart: () => set({ cart: [] }),
}));
