export const fetchProducts = async () => {
	const response = await fetch(
		"https://santosnr6.github.io/Data/pixelforgeproducts.json",
	);

	if (!response.ok) {
		throw new Error("Något gick fel vid API-anropet");
	}

	const data = await response.json();

	return data;
};

export const fetchDocuments = async () => {
	const response = await fetch(
		"https://santosnr6.github.io/Data/pixelforgedocuments.json",
	);

	if (!response.ok) {
		throw new Error("Något gick fel vid API-anropet");
	}

	const data = await response.json();

	return data;
};

export const askQuestion = async ({ question, history }) => {
	const response = await fetch("http://localhost:8080/api/chat", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			question,
			history,
		}),
	});

	if (!response.ok) {
		throw new Error("Något gick fel vid API-anropet");
	}

	const data = await response.json();
	return data;
};
