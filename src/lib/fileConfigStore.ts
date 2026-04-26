import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export interface RouterRuntimeConfig {
  ollamaBaseUrl: string;
  defaultModel: string;
}

const defaultRuntimeConfig: RouterRuntimeConfig = {
  ollamaBaseUrl: "http://127.0.0.1:11434",
  defaultModel: "llama3.2"
};

export class FileConfigStore {
  constructor(private readonly filePath: string) {}

  async read(): Promise<RouterRuntimeConfig> {
    try {
      const data = await readFile(this.filePath, "utf-8");
      return { ...defaultRuntimeConfig, ...JSON.parse(data) } as RouterRuntimeConfig;
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
