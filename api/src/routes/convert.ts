import { exists, mkdir } from "fs/promises";
import { Context } from "hono";
import { join } from "path";
import ffmpeg from "fluent-ffmpeg";

import { seedID, getFileLocationOnServer } from "../utils";
import { CONVERTED_DIR_NAME, rootPath } from "../globals";

export default async function convert(c: Context) {
	const params = c.req.param();
	const { ext, targetExt } = params;
	const body = await c.req.formData();
	const file = body.get("file");

	if (!file || !(file instanceof Blob))
		return Response.json(
			{ message: "No file" },
			{
				status: 400,
			},
		);

	// Create it if it doesn't exist
	if (!(await exists(join(rootPath, CONVERTED_DIR_NAME))))
		await mkdir(join(rootPath, CONVERTED_DIR_NAME));

	const path = join(rootPath, CONVERTED_DIR_NAME);
	const id = seedID(Date.now().toString());
	const filename = join(path, `${id}.${ext}`);
	const newFilename = `${filename
		.split(".")
		.slice(0, -1)
		.join(".")}.${targetExt}`;

	conversionState[id] ??= {} as ConversionState;
	conversionState[id].target = targetExt;

	await Bun.write(filename, file);
	convertFile(ext, targetExt, filename, newFilename, id);

	conversionState[id].filename = getFileLocationOnServer(
		newFilename,
		c.req.url,
	);

	return Response.json({ id });
}

async function convertFile(
	from: string,
	to: string,
	file: string,
	newFile: string,
	id: string,
) {
	ffmpeg()
		.input(file)
		.on("progress", (progress) => {
			conversionState[id].percent = progress.percent;
		})
		.on("end", () => {
			conversionState[id].completed = true;
		})
		.saveToFile(newFile);
}

type ConversionState = {
	percent: number;
	filename: string;
	completed?: boolean;
	target: string;
};
type ConversionStateRecord = Record<string, ConversionState>;
export const conversionState: ConversionStateRecord = {};
