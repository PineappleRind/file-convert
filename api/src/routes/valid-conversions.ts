import { Context } from "hono";

const validConversions = {
	audio: ["mp3", "m4a", "wav"],
	video: ["mov", "mp4"],
};

export default async function convert(c: Context) {
	return Response.json(validConversions);
}
