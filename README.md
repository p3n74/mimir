# Mimir

Mimir is an OpenAI-compatible LLM API router that forwards requests to Ollama over your local network.

## Why this setup

- Run **Mimir** on your Coolify VM
- Run **Ollama** on your GPU host machine
- Point Mimir to the host LAN IP so the VM can call Ollama

## Features (current)

- OpenAI-compatible `POST /v1/chat/completions`
- Model list passthrough at `GET /v1/models`
- Runtime config API (`GET/POST /api/config`)
- Minimal web UI at `/` to update router config and set a shared **API password** (Bearer token)
- Optional env `ROUTER_API_KEY` as an alternate Bearer secret (useful for Coolify secrets)
- You can still rely on Cloudflare Access at the edge; the API password is a simple extra gate for `/v1/*` and `/api/*`

## Local development

1. Install deps
   - `npm install`
2. Configure env
   - `cp .env.example .env`
3. Run dev server
   - `npm run dev`

## Environment variables

- `PORT` default: `3000`
- `HOST` default: `0.0.0.0`
- `OLLAMA_BASE_URL` default: `http://127.0.0.1:11434`
- `CONFIG_FILE_PATH` default: `./data/config.json`
- `ROUTER_API_KEY` optional: if set, requests may authenticate with that Bearer value instead of (or as well as) the dashboard-configured API password

## Deploy on Coolify

1. Create a new app from this repo.
2. Use Dockerfile build.
3. Set env vars, especially:
   - `OLLAMA_BASE_URL=http://<HOST_PC_LAN_IP>:11434`
4. Attach domain: `mimir.citadel-codex.com`
5. Put Cloudflare Access in front of the domain.

## Test with curl

When an API password is configured (or `ROUTER_API_KEY` is set), send a Bearer header:

```bash
curl -sS "https://mimir.citadel-codex.com/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_PASSWORD" \
  -d '{
    "model": "llama3.2",
    "messages": [{"role": "user", "content": "Hello from Mimir"}]
  }'
```

List models:

```bash
curl -sS "https://mimir.citadel-codex.com/v1/models" \
  -H "Authorization: Bearer YOUR_PASSWORD"
```

## Notes

- Keep Ollama port restricted to VM/subnet in your firewall.
- This version returns non-stream chat completions; streaming can be added next.
