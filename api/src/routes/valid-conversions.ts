import { Context } from "hono";

export const extensions = {
	audio: ["mp3", "m4a", "wav", "ogg"],
	video: ["mov", "mp4", "mpg", "avi"],
	image: ["webp", "png", "jpeg", "gif" /*"ico"*/],
};

export const legalConversions = [
	["audio", "audio"],
	["video", "video"],
	["audio", "video"],
	["image", "image"],
];

export default async function convert(c: Context) {
	return Response.json({
		legalConversions,
		extensions,
	});
}
