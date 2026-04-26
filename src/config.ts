import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default("0.0.0.0"),
  OLLAMA_BASE_URL: z.string().url().default("http://127.0.0.1:11434"),
  ROUTER_API_KEY: z.string().optional(),
  CONFIG_FILE_PATH: z.string().default("./data/config.json")
});

export type AppConfig = z.infer<typeof envSchema>;

export const config: AppConfig = envSchema.parse(process.env);
