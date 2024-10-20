import { exists, mkdir } from "fs/promises";
import { Context } from "hono";
import { join } from "path";
import ffmpeg from "fluent-ffmpeg";

import { seedID, getFileLocationOnServer, findTypeFromExt } from "../utils";
import { CONVERTED_DIR_NAME, rootPath } from "../globals";
import { extensions, legalConversions } from "./valid-conversions";

export default async function convert(c: Context) {
	const params = c.req.param();
	const { ext, targetExt } = params;
	const conversionValidity = isValidConversion(ext, targetExt);
	if (!conversionValidity.valid)
		return Response.json(
			{ message: conversionValidity.message },
			{ status: 400 },
		);

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
	try {
		convertFile(filename, newFilename, id);
	} catch (e) {
		return Response.json({ error: e });
	}

	conversionState[id].filename = getFileLocationOnServer(
		newFilename,
		c.req.url,
	);

	return Response.json({ id });
}

function isValidConversion(ext: string, targetExt: string) {
	const type = findTypeFromExt(ext);
	const targetType = findTypeFromExt(targetExt);
	if (!type || !targetType)
		return {
			valid: false,
			message: `Invalid or unsupported extension(s) ${[
				!type ? ext : "",
				!targetType ? targetExt : "",
			].join(", ")}`,
		};
	// Sort so that we can guarantee the same order as `legalConversions`
	let conversion = [type, targetType].slice().sort();
	// we join so that this is a string comparison (array comparisons don't work)
	if (
		!legalConversions.some(
			(compareConversion) =>
				conversion.join(",") !== compareConversion.slice().sort().join(","),
		)
	)
		return {
			valid: false,
			message: `Cannot convert from ${type} to ${targetType}`,
		};
	return { valid: true };
}

async function convertFile(file: string, newFile: string, id: string) {
	ffmpeg()
		.input(file)
		.on("progress", (progress) => {
			conversionState[id].percent = progress.percent;
		})
		.on("end", () => {
			conversionState[id].completed = true;
		})
		.on("error", (err, stdout, stderr) => {
			conversionState[id].completed = err;
		})
		.saveToFile(newFile);
}

type ConversionState = {
	percent: number;
	filename: string;
	completed?: boolean | string;
	target: string;
};
type ConversionStateRecord = Record<string, ConversionState>;
export const conversionState: ConversionStateRecord = {};
