import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { FileConfigStore } from "../lib/fileConfigStore.js";

const updateConfigSchema = z.object({
  ollamaBaseUrl: z.string().url(),
  defaultModel: z.string().min(1)
});

export async function registerConfigRoutes(app: FastifyInstance, configStore: FileConfigStore) {
  app.get("/api/config", async () => configStore.read());

  app.post("/api/config", async (request, reply) => {
    const body = updateConfigSchema.parse(request.body);
    await configStore.write(body);
    return reply.send({ ok: true, config: body });
  });
}
