import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { join } from "path";
import { file } from "bun";

import routes from "./routes";

const app = new Hono();
app.use("/*", cors({ origin: "*" }));
app.use("/converted/*", serveStatic({ root: "./api/" }));
app.get("/status/:id", routes.status);
app.get("/valid-conversions", routes.validConversions);
app.post("/convert/:ext/:targetExt", routes.convert);
app.get("/", async (c) => {
	return new Response(
		await file(
			Bun.fileURLToPath(
				new URL(join(import.meta.url, "../../docs/index.html")),
			),
		).text(),
		{
			headers: {
				"Content-Type": "text/html",
			},
		},
	);
});

const port = process.env.PORT || 8000;
console.log(`Running file-convert-api on port ${port}...`);
Bun.serve({ ...app, port });
