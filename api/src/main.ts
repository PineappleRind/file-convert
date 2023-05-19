import { Hono } from "hono";
import routes from "./routes";
import { join } from "path";
import { file } from "bun";

const app = new Hono();
app.get("/status/:id", routes.status);
app.get("/convert/:ext", routes.convert);
app.get("/", async (c) => {
    return new Response(await file(Bun.fileURLToPath(new URL(join(import.meta.url, "../../docs/index.html")))).text(), {
        headers: {
            "Content-Type": "text/html"
        }
    })
})

Bun.serve({ ...app, port: 8000 })