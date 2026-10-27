import "./index.css";
import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Trash2 } from "lucide-react";
import { Icon } from "@pixelforge/icon";
import { useChat } from "@pixelforge/usechat";
import { Message } from "@pixelforge/message";

export const Chat = () => {
	const [isOpen, setIsOpen] = useState(false);
	const { messages, getAnswer, isLoading, error, clearHistory } = useChat();
	const inputRef = useRef(null);
	const messagesRef = useRef(null);

	useEffect(() => {
		if (messagesRef.current) {
			messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
		}
	}, [messages, isLoading, isOpen]);

	const handleSubmit = (event) => {
		event.preventDefault();
		const userInput = inputRef.current.value;
		if (!userInput.trim()) return;

		inputRef.current.value = "";
		getAnswer(userInput);
	};

	return (
		<div className="chat-widget">
			{isOpen && (
				<article className="chat chat--open">
					<header className="chat__header">
						<h3>PixelForge Support</h3>
						<div className="chat__header-actions">
							<button
								type="button"
								onClick={clearHistory}
								aria-label="Rensa chatt"
								title="Rensa chatt"
							>
								<Icon icon={Trash2} size={16} />
							</button>
							<button
								type="button"
								onClick={() => setIsOpen(false)}
								aria-label="Stäng chatt"
							>
								<Icon icon={X} size={18} />
							</button>
						</div>
					</header>

					<ul className="chat__messages" ref={messagesRef}>
						{messages.map((message, index) => (
							<Message
								key={index}
								content={message.content}
								role={message.role}
							/>
						))}
						{isLoading && (
							<li className="chat__loading">Skriver...</li>
						)}
						{error && <li className="chat__error">{error}</li>}
					</ul>

					<form className="chat__form" onSubmit={handleSubmit}>
						<input
							type="text"
							className="chat__input"
							placeholder="Ställ en fråga..."
							ref={inputRef}
							disabled={isLoading}
						/>
						<button
							type="submit"
							className="chat__submit"
							disabled={isLoading}
							aria-label="Skicka"
						>
							<Icon icon={Send} size={16} />
						</button>
					</form>
				</article>
			)}

			<button
				type="button"
				className="chat-widget__trigger"
				onClick={() => setIsOpen((prev) => !prev)}
				aria-label="Öppna chatt"
			>
				<Icon icon={isOpen ? X : MessageSquare} size={24} />
			</button>
		</div>
	);
};
