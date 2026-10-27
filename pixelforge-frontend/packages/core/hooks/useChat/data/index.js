import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { askQuestion } from "@pixelforge/api";
import { useCartStore } from "@pixelforge/usecartstore";

const INITIAL_MESSAGE = {
	role: "assistant",
	content:
		"Tjenixen! Jag är PixelForges AI-assistent. Vad kan jag hjälpa dig med idag?",
};

export const useChat = () => {
	const [messages, setMessages] = useState(() => {
		const saved = localStorage.getItem("messages");
		return saved ? JSON.parse(saved) : [INITIAL_MESSAGE];
	});

	const addToCart = useCartStore((state) => state.addToCart);
	const removeFromCart = useCartStore((state) => state.removeFromCart);
	const clearCart = useCartStore((state) => state.clearCart);

	useEffect(() => {
		localStorage.setItem("messages", JSON.stringify(messages));
	}, [messages]);

	const { mutateAsync, isPending, error, reset } = useMutation({
		mutationFn: askQuestion,
	});

	const getAnswer = async (question) => {
		if (!question.trim()) return;

		const userMessage = { role: "user", content: question };
		const updatedMessages = [...messages, userMessage];
		setMessages(updatedMessages);

		try {
			const { answer, cartActions = [] } = await mutateAsync({
				question,
				history: messages,
			});

			console.log(cartActions);

			for (const action of cartActions) {
				if (action.type === "add" && action.product) {
					addToCart(action.product);
				} else if (action.type === "remove" && action.productId) {
					removeFromCart(action.productId);
				} else if (action.type === "clear") {
					clearCart();
				}
			}

			setMessages([
				...updatedMessages,
				{ role: "assistant", content: answer },
			]);
		} catch (err) {
			console.error(err);
		}
	};

	const clearHistory = () => {
		reset();
		setMessages([INITIAL_MESSAGE]);
	};

	return {
		messages,
		getAnswer,
		isLoading: isPending,
		error: error?.message || null,
		clearHistory,
	};
};
