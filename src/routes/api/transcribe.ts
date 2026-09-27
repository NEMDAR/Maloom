import { createFileRoute } from "@tanstack/react-router";
import { ApiError, MAX_AUDIO_BYTES, contextSchema, directionSchema, errorResponse, isConfigured, transcribe, translate } from "@/lib/translate.server";
import { clientIp, rateLimit, readLimited } from "@/lib/guard.server";

const MAX_MULTIPART_BYTES = MAX_AUDIO_BYTES + 64 * 1024;
const TOO_LARGE = "التسجيل أكبر من 10 ميغابايت.";

export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          if (!isConfigured()) throw new ApiError(503, "not_configured", "خدمة الترجمة غير مهيأة على الخادم.");
          const type = request.headers.get("content-type") ?? "";
          if (!type.startsWith("multipart/form-data")) throw new ApiError(415, "bad_type", "صيغة الطلب غير مدعومة.");
          rateLimit("audio", clientIp(request));
          // Cap the raw body before any multipart parsing (also covers chunked uploads).
          const bytes = await readLimited(request, MAX_MULTIPART_BYTES, TOO_LARGE);
          const form = await new Response(bytes as Uint8Array<ArrayBuffer>, { headers: { "content-type": type } }).formData().catch(() => null);
          const audio = form?.get("audio");
          if (!(audio instanceof File) || audio.size === 0) throw new ApiError(400, "no_audio", "لم يصل أي تسجيل.");
          if (audio.size > MAX_AUDIO_BYTES) throw new ApiError(413, "too_large", TOO_LARGE);
          if (audio.type && !audio.type.startsWith("audio/") && !audio.type.startsWith("video/webm")) throw new ApiError(415, "bad_type", "صيغة الملف غير مدعومة.");
          const direction = directionSchema.parse(form?.get("direction"));
          const context = contextSchema.parse(form?.get("context"));
          // Audio is held in memory only for this request and never stored.
          const transcript = await transcribe(audio);
          const out = await translate({ text: transcript, direction, context });
          return Response.json({ source: transcript, ...out }, { headers: { "Cache-Control": "no-store" } });
        } catch (e) {
          return errorResponse(e);
        }
      },
    },
  },
});
