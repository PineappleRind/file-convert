import { exists, mkdir } from "fs/promises";
import { Context } from "hono";
import { join } from "path";
import { spawn } from "bun";
import { seedID } from "../utils";

const CONVERTED_DIR_NAME = "converted";

export default async function convert(c: Context) {
    const params = c.req.param();
    const { ext, targetExt } = params,
        body = await c.req.formData(),
        file = body.get("file");

    if (!file || !(file instanceof Blob)) return Response.json({ message: "No file" }, {
        status: 400
    });

    let projectRootPath = Bun.fileURLToPath(new URL(join(import.meta.url, "../../..")));
    // Create it if it doesn't exist
    if (!(await exists(join(projectRootPath, CONVERTED_DIR_NAME)))) await mkdir(join(projectRootPath, CONVERTED_DIR_NAME));
    projectRootPath = join(projectRootPath, CONVERTED_DIR_NAME);

    const filename = `${seedID(Date.now().toString())}.${ext}`,
        newFilename = join(projectRootPath, filename).split(".").slice(0, -1).join(".") + "." + targetExt;
    await Bun.write(join(projectRootPath, filename), file);
    await convertFile(
        ext,
        targetExt,
        join(projectRootPath, filename),
        newFilename
    );

    return Response.json({
        filename: `${new URL(c.req.raw.url).origin}/${CONVERTED_DIR_NAME}/${newFilename.split("/").slice(-1)}`
    })
}

async function convertFile(from: string, to: string, file: string, newFile: string) {
    spawn({
        cmd: ["ffmpeg", `-i`, file, `-progress`, `/dev/stdout`, newFile]
    })
}