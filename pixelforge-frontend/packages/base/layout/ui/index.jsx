import { Outlet } from "react-router-dom";
import { Header } from "@pixelforge/header";
import { Footer } from "@pixelforge/footer";
import "./index.css";
import { Chat } from "../../../shared/chat";

export const Layout = () => {
	return (
		<>
			<Header />
			<main className="page">
				<Outlet />
			</main>
			<Footer />
			<Chat />
		</>
	);
};
