import { Context } from "hono";
import { conversionState } from "./convert";
import { CONVERTED_DIR_NAME, rootPath } from "../globals";
import { join } from "path";
import { readdir } from "fs/promises";
import { getFileLocationOnServer } from "../utils";

export default async function status(c: Context) {
	const { id } = c.req.param();
	const state = conversionState[id];

	if (typeof state?.completed === "string")
		return Response.json({ error: state.completed });
	const convertedDir = join(rootPath, CONVERTED_DIR_NAME);
	const files = await readdir(convertedDir);
	// If the file exists, and the conversion is completed...
	if ((!state || state.completed) && files.some((file) => file.includes(id)))
		return Response.json({
			percent: 100,
			completed: true,
			filename: getFileLocationOnServer(
				files.find(
					(file) =>
						file.includes(id) &&
						file.toLowerCase().endsWith(state.target.toLowerCase()),
				) as string,
				c.req.url,
			),
		});

	if (!state)
		return Response.json(
			{ message: `Could not find id "${id}"` },
			{
				status: 404,
			},
		);

	return Response.json({
		percent: state.percent || 0,
	});
}
