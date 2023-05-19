import { Context } from "hono";

export default function convert(c: Context): Response {
    const params = c.req.param();
    const ext = params.ext;
    
    return new Response("Yallah")
}