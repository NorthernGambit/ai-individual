import "./index.css";
import Markdown from "react-markdown";

export const Message = ({ content, role }) => {
	const isOwnMessage = role === "user";

	return (
		<li
			className={`message ${isOwnMessage ? "message--user" : "message--bot"}`}
		>
			<section className="message__bubble">
				<span className="message__sender">
					{isOwnMessage ? "Du" : "PixelForge AI"}
				</span>

				<div className="message__text">
					<Markdown>{content}</Markdown>
				</div>
			</section>
		</li>
	);
};
