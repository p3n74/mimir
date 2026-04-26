import Fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "./config.js";
import { FileConfigStore } from "./lib/fileConfigStore.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerRouterRoutes } from "./routes/router.js";
import { registerConfigRoutes } from "./routes/config.js";
import { registerUiRoutes } from "./routes/ui.js";
import { OllamaClient } from "./services/ollamaClient.js";

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

if (config.ROUTER_API_KEY) {
  app.addHook("onRequest", async (request, reply) => {
    const auth = request.headers.authorization;
    const valid = auth === `Bearer ${config.ROUTER_API_KEY}`;

    const isProtectedPath = request.url.startsWith("/api") || request.url.startsWith("/v1");
    if (!valid && isProtectedPath) {
      return reply.code(401).send({ error: "Unauthorized" });
    }
  });
}

const store = new FileConfigStore(config.CONFIG_FILE_PATH);
const seed = await store.read();
if (seed.ollamaBaseUrl === "http://127.0.0.1:11434" && config.OLLAMA_BASE_URL !== seed.ollamaBaseUrl) {
  await store.write({ ...seed, ollamaBaseUrl: config.OLLAMA_BASE_URL });
}

const ollama = new OllamaClient(() => store.read());

await registerUiRoutes(app);
await registerHealthRoutes(app);
await registerConfigRoutes(app, store);
await registerRouterRoutes(app, ollama);

app.setErrorHandler((error, _request, reply) => {
  app.log.error(error);
  if ((error as { issues?: unknown }).issues) {
    const message = error instanceof Error ? error.message : "Unknown validation error";
    return reply.code(400).send({ error: "Validation error", detail: message });
  }
  return reply.code(500).send({ error: "Internal server error" });
});

await app.listen({ port: config.PORT, host: config.HOST });
