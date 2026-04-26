import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { toPublicRouterConfig, type FileConfigStore } from "../lib/fileConfigStore.js";

const updateConfigSchema = z.object({
  ollamaBaseUrl: z.string().url(),
  defaultModel: z.string().min(1),
  /** Omit to leave unchanged; send "" to disable API password. */
  apiPassword: z.string().optional()
});

export async function registerConfigRoutes(app: FastifyInstance, configStore: FileConfigStore) {
  app.get("/api/config", async () => toPublicRouterConfig(await configStore.read()));

  app.post("/api/config", async (request, reply) => {
    const body = updateConfigSchema.parse(request.body);
    const current = await configStore.read();
    const next = {
      ollamaBaseUrl: body.ollamaBaseUrl,
      defaultModel: body.defaultModel,
      apiPassword: body.apiPassword !== undefined ? body.apiPassword : current.apiPassword
    };
    await configStore.write(next);
    return reply.send({ ok: true, config: toPublicRouterConfig(next) });
  });
}
