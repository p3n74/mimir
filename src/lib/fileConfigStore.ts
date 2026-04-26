import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export interface RouterRuntimeConfig {
  ollamaBaseUrl: string;
  defaultModel: string;
  /** Plain shared secret; empty means no Bearer requirement (except optional env override). */
  apiPassword: string;
}

export interface PublicRouterConfig {
  ollamaBaseUrl: string;
  defaultModel: string;
  apiPasswordSet: boolean;
}

const defaultRuntimeConfig: RouterRuntimeConfig = {
  ollamaBaseUrl: "http://127.0.0.1:11434",
  defaultModel: "llama3.2",
  apiPassword: ""
};

export function toPublicRouterConfig(cfg: RouterRuntimeConfig): PublicRouterConfig {
  return {
    ollamaBaseUrl: cfg.ollamaBaseUrl,
    defaultModel: cfg.defaultModel,
    apiPasswordSet: Boolean(cfg.apiPassword?.trim())
  };
}

export class FileConfigStore {
  constructor(private readonly filePath: string) {}

  async read(): Promise<RouterRuntimeConfig> {
    try {
      const data = await readFile(this.filePath, "utf-8");
      const parsed = JSON.parse(data) as Partial<RouterRuntimeConfig>;
      return { ...defaultRuntimeConfig, ...parsed, apiPassword: String(parsed.apiPassword ?? "") };
    } catch {
      await this.write(defaultRuntimeConfig);
      return defaultRuntimeConfig;
    }
  }

  async write(next: RouterRuntimeConfig): Promise<void> {
    const dir = path.dirname(this.filePath);
    await mkdir(dir, { recursive: true });
    await writeFile(this.filePath, JSON.stringify(next, null, 2), "utf-8");
  }
}
