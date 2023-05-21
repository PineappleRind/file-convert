type AvailableExtensions = {
	[type: string]: string[];
};

export const apiURL = `http://localhost:8000`;
export const exts: AvailableExtensions = await (
	await fetch(`${apiURL}/valid-conversions`)
).json();
console.log(exts);
export const legalConversions = [
	["audio", "audio"],
	["video", "video"],
	["audio", "video"],
	["image", "image"],
];

// Some MIME types do not accurately
// reflect the file extension.
export const mimeTypeToExt = {
	mpeg: "mp3",
	quicktime: "mov",
};
