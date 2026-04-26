import type { FastifyInstance } from "fastify";
import type { OllamaClient } from "../services/ollamaClient.js";

export async function registerRouterRoutes(app: FastifyInstance, ollama: OllamaClient) {
  app.get("/v1/models", async (_request, reply) => {
    const models = await ollama.listModels();
    return reply.send(models);
  });

  app.post("/v1/chat/completions", async (request, reply) => {
    const body = request.body as {
      model?: string;
      messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
      stream?: boolean;
    };

    if (!Array.isArray(body?.messages) || body.messages.length === 0) {
      return reply.code(400).send({ error: "messages is required" });
    }

    const result = await ollama.chatCompletion(body);
    return reply.send(result);
  });
}
