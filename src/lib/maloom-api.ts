import type { ContextKey, Direction, TranslationFixture } from "./maloom";

export const MAX_TEXT = 500;
export const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

interface ApiResult { source: string; translation: string; simpler: string | null; alternatives: string[] }
export class ClientApiError extends Error { constructor(public code: string, message: string) { super(message); } }

/** Cost-free probe: the server answers 503 before validation or any provider call when unconfigured. */
export async function backendConfigured(): Promise<boolean> {
  try {
    const r = await fetch("/api/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    return r.status !== 503;
  } catch { return false; }
}

function toFixture(r: ApiResult, direction: Direction, context: ContextKey): TranslationFixture {
  const item: TranslationFixture = { id: `live-${Date.now()}`, context, direction, source: r.source, target: r.translation };
  if (r.simpler) item.simpler = r.simpler;
  if (r.alternatives.length > 1) item.ambiguity = r.alternatives;
  return item;
}

async function handle(res: Response, direction: Direction, context: ContextKey) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = (data as { error?: { code: string; message: string } } | null)?.error;
    throw new ClientApiError(err?.code ?? "network", err?.message ?? "تعذر الاتصال بالخادم.");
  }
  return toFixture(data as ApiResult, direction, context);
}

export async function translateRemote(text: string, direction: Direction, context: ContextKey) {
  const res = await fetch("/api/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, direction, context }) }).catch(() => { throw new ClientApiError("network", "تعذر الاتصال بالخادم."); });
  return handle(res, direction, context);
}

export async function transcribeRemote(audio: Blob, direction: Direction, context: ContextKey) {
  if (audio.size > MAX_AUDIO_BYTES) throw new ClientApiError("too_large", "التسجيل أكبر من 10 ميغابايت.");
  const form = new FormData();
  const ext = audio.type.includes("mp4") ? "m4a" : audio.type.includes("ogg") ? "ogg" : "webm";
  form.append("audio", audio, `recording.${ext}`);
  form.append("direction", direction);
  form.append("context", context);
  const res = await fetch("/api/transcribe", { method: "POST", body: form }).catch(() => { throw new ClientApiError("network", "تعذر الاتصال بالخادم."); });
  return handle(res, direction, context);
}
