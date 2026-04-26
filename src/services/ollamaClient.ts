import type { RouterRuntimeConfig } from "../lib/fileConfigStore.js";

interface OpenAIChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIChatRequest {
  model?: string;
  messages: OpenAIChatMessage[];
  stream?: boolean;
}

export class OllamaClient {
  constructor(private readonly getConfig: () => Promise<RouterRuntimeConfig>) {}

  async listModels() {
    const cfg = await this.getConfig();
    const response = await fetch(`${cfg.ollamaBaseUrl}/api/tags`);

    if (!response.ok) {
      throw new Error(`Failed to list models: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async chatCompletion(body: OpenAIChatRequest) {
    const cfg = await this.getConfig();

    const response = await fetch(`${cfg.ollamaBaseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: body.model ?? cfg.defaultModel,
        messages: body.messages,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama chat failed: ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as {
      model: string;
      message?: { role: string; content: string };
      done: boolean;
      created_at?: string;
    };

    const content = payload.message?.content ?? "";

    return {
      id: `chatcmpl-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: payload.model,
      choices: [
        {
          index: 0,
          message: { role: "assistant", content },
          finish_reason: payload.done ? "stop" : "length"
        }
      ]
    };
  }
}
