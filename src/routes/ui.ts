import type { FastifyInstance } from "fastify";
import { readFile } from "node:fs/promises";

export async function registerUiRoutes(app: FastifyInstance) {
  app.get("/", async (_request, reply) => {
    const html = await readFile("./public/index.html", "utf-8");
    return reply.type("text/html").send(html);
  });
}
