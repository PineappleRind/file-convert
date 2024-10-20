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
export function mimeTypeToExt(type: string) {
	const map: Record<string, string> = {
		mpeg: "mp3",
		quicktime: "mov",
		"x-m4a": "m4a",
	};
	return map[type || ""] || type;
}
