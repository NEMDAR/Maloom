# معلوم — Maloom

Two-way translator between clear Arabic and simplified Gulf contact Arabic (TanStack Start, RTL, mobile-first).

## Architecture
- `POST /api/translate` — JSON `{ text (≤500 chars), direction: "pidgin-to-arabic" | "arabic-to-pidgin", context }` → `{ source, translation, simpler, alternatives[] }`.
- `POST /api/transcribe` — multipart `audio` (≤10 MB), `direction`, `context` → transcribes, then runs the same translation.
- `GET /api/health` — `{ status: "ok" }` only, for Coolify health checks (no key/config status).
- When the key is missing, translate/transcribe return `503 not_configured` before any validation or provider call; the UI treats that as demo mode.

## Abuse protection (MVP)
- Per-IP fixed-window limit, in memory, bounded to 10k tracked IPs: `RATE_LIMIT_TEXT` (default 40) and `RATE_LIMIT_AUDIO` (default 15) per `RATE_LIMIT_WINDOW_SECONDS` (default 600). Over the limit → `429` with `Retry-After`.
- Body caps before parsing: JSON 4 KB, multipart 10 MB + 64 KB. Enforced while streaming, so chunked bodies without `Content-Length` are cut off → `413`.
- **Proxy trust:** set `TRUST_PROXY=1` only if the container port is not publicly exposed and all traffic passes through Coolify's proxy (which sets `X-Real-IP`/`X-Forwarded-For`). Without it every client shares one bucket behind the proxy.
- **Limitation:** counters live per process and reset on restart. With multiple replicas each keeps its own count; move to a shared store (e.g. Redis) before scaling out. Also set a spending cap in your OpenAI account.
- OpenAI is called only from the server (`src/lib/translate.server.ts`) with `OPENAI_API_KEY`. The key never reaches the browser. User text/audio is not logged or stored; 30 s upstream timeout.
- If `OPENAI_API_KEY` is missing, the UI shows a labeled demo mode that only answers the built-in example phrases.
- Favorites, history and settings stay in the browser (localStorage).

## Environment
Copy `.env.example`. Required: `OPENAI_API_KEY`. Optional: `OPENAI_MODEL`, `OPENAI_TRANSCRIBE_MODEL`, `OPENAI_BASE_URL`, `PORT`.

## Local
```sh
bun install
OPENAI_API_KEY=sk-... bun run dev
```
Production build for Node: `NITRO_PRESET=node-server bun run build && node .output/server/index.mjs`.

## Deploy on Coolify (NEMDAR — maloom.nemdar.tech)
1. Push this repo to GitHub (Lovable: Project Settings → GitHub → Connect).
2. Coolify → New Resource → Public/Private Git repository → select the repo, branch `main`.
3. Build pack: **Dockerfile** (or Docker Compose using `docker-compose.yml`). Port: `3000`.
4. Environment variables: add `OPENAI_API_KEY` (secret), `TRUST_PROXY=1`, optional model/limit overrides.
5. Health check path: `/api/health`.
6. Domain: `https://maloom.nemdar.tech`. Create an `A` record for `maloom` pointing to the Coolify server IP (done by you in your DNS panel), then let Coolify issue the TLS certificate.
7. Deploy. Verify `https://maloom.nemdar.tech/api/health` returns `{"status":"ok"}`, then try one translation in the app.

Microphone recording requires HTTPS (or localhost).
