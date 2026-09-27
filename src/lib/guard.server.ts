import { ApiError } from "./translate.server";

/**
 * In-memory, per-process fixed-window limiter (single-instance MVP).
 * - Memory is bounded: at most MAX_KEYS entries; expired entries are swept, and the
 *   oldest entries are evicted when full.
 * - Multiple replicas each keep their own counters (effective limit = N × limit).
 *   Use a shared store (e.g. Redis) before scaling horizontally.
 */
const MAX_KEYS = 10_000;
const buckets = new Map<string, { count: number; resetAt: number }>();

function envInt(name: string, fallback: number) {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : fallback;
}

export function rateLimit(scope: "text" | "audio", ip: string) {
  const windowMs = envInt("RATE_LIMIT_WINDOW_SECONDS", 600) * 1000;
  const limit = scope === "text" ? envInt("RATE_LIMIT_TEXT", 40) : envInt("RATE_LIMIT_AUDIO", 15);
  const now = Date.now();
  const key = `${scope}:${ip}`;
  let b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    if (buckets.size >= MAX_KEYS) {
      for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
      while (buckets.size >= MAX_KEYS) { const first = buckets.keys().next().value; if (first === undefined) break; buckets.delete(first); }
    }
    b = { count: 0, resetAt: now + windowMs };
    buckets.delete(key);
    buckets.set(key, b);
  }
  b.count++;
  if (b.count > limit) {
    const retry = Math.max(1, Math.ceil((b.resetAt - now) / 1000));
    throw Object.assign(new ApiError(429, "rate_limited", "عدد الطلبات كبير. حاول مرة أخرى بعد قليل."), { retryAfter: retry });
  }
}

/**
 * Client IP. Forwarded headers are trusted ONLY when TRUST_PROXY=1, i.e. the app is
 * reachable solely through a reverse proxy (Coolify/Traefik) that overwrites them.
 * Otherwise clients could spoof X-Forwarded-For to dodge the limit.
 */
export function clientIp(request: Request): string {
  if (process.env["TRUST_PROXY"] === "1") {
    const real = request.headers.get("x-real-ip")?.trim();
    if (real) return real;
    // Right-most entry is the one appended by the nearest trusted proxy.
    const xff = request.headers.get("x-forwarded-for")?.split(",").map((s) => s.trim()).filter(Boolean);
    if (xff?.length) return xff[xff.length - 1]!;
  }
  const r = request as Request & { ip?: string };
  return r.ip || request.headers.get("cf-connecting-ip") || "unknown";
}

/** Reads the body with a hard byte cap, aborting early (handles chunked bodies without Content-Length). */
export async function readLimited(request: Request, maxBytes: number, message: string): Promise<Uint8Array<ArrayBuffer>> {
  const len = request.headers.get("content-length");
  if (len && Number(len) > maxBytes) throw new ApiError(413, "too_large", message);
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) { await reader.cancel().catch(() => {}); throw new ApiError(413, "too_large", message); }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let o = 0;
  for (const c of chunks) { out.set(c, o); o += c.byteLength; }
  return out;
}
