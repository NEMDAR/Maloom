<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep translation behavior behind a typed frontend-only service and local fixtures so a future service can replace it without changing route UI.
- Persist Maloom preferences, favorites, and conversation history through one browser-storage module to keep local-only data behavior consistent.
- Translation/transcription run only in server routes under src/routes/api/ via src/lib/translate.server.ts with OPENAI_API_KEY — keeps the key server-side; local fixtures are fallback only when unconfigured.
- Self-hosted deploys build with NITRO_PRESET=node-server (Dockerfile) — Coolify runs a Node server.
