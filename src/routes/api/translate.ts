import { createFileRoute } from "@tanstack/react-router";
import { ApiError, errorResponse, isConfigured, translate, translateInput } from "@/lib/translate.server";
import { clientIp, rateLimit, readLimited } from "@/lib/guard.server";

const MAX_JSON_BYTES = 4 * 1024;

export const Route = createFileRoute("/api/translate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          if (!isConfigured()) throw new ApiError(503, "not_configured", "خدمة الترجمة غير مهيأة على الخادم.");
          rateLimit("text", clientIp(request));
          const bytes = await readLimited(request, MAX_JSON_BYTES, "النص طويل جدًا.");
          let body: unknown = null;
          try { body = JSON.parse(new TextDecoder().decode(bytes)); } catch { /* handled by schema */ }
          const input = translateInput.parse(body);
          const out = await translate(input);
          return Response.json({ source: input.text, ...out }, { headers: { "Cache-Control": "no-store" } });
        } catch (e) {
          return errorResponse(e);
        }
      },
    },
  },
});
