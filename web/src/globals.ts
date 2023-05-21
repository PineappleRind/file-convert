type AvailableExtensions = {
	extensions: {
		[type: string]: string[];
	};
	legalConversions: string[][];
};

export const apiURL = `http://localhost:8000`;
export const conversions: AvailableExtensions = await (
	await fetch(`${apiURL}/valid-conversions`)
).json();

// Some MIME types do not accurately
// reflect the file extension.
export const mimeTypeToExt = {
	mpeg: "mp3",
	quicktime: "mov",
};
