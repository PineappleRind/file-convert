import { join } from "path";

export const CONVERTED_DIR_NAME = "converted";
export const rootPath = Bun.fileURLToPath(
	new URL(join(import.meta.url, "../../")),
);
