import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash } from "crypto";

const InputSchema = z.object({
  eventName: z.string().min(1).max(100),
  eventSourceUrl: z.string().url().max(2000).optional(),
  eventId: z.string().max(200).optional(),
  userAgent: z.string().max(1000).optional(),
  email: z.string().email().max(320).optional(),
  phone: z.string().max(50).optional(),
  fbp: z.string().max(200).optional(),
  fbc: z.string().max(500).optional(),
});

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export const sendMetaConversion = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const token = process.env.META_CONVERSIONS_TOKEN;
    const pixelId = process.env.META_PIXEL_ID;

    if (!token || !pixelId) {
      console.warn("[meta-conversion] Missing META_CONVERSIONS_TOKEN or META_PIXEL_ID");
      return { success: false, reason: "not_configured" as const };
    }

    const userData: Record<string, string> = {};
    if (data.email) userData.em = sha256(data.email);
    if (data.phone) userData.ph = sha256(data.phone.replace(/\D/g, ""));
    if (data.fbp) userData.fbp = data.fbp;
    if (data.fbc) userData.fbc = data.fbc;
    if (data.userAgent) userData.client_user_agent = data.userAgent;

    const payload = {
      data: [
        {
          event_name: data.eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: data.eventId,
          event_source_url: data.eventSourceUrl,
          action_source: "website",
          user_data: userData,
        },
      ],
    };

    try {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("[meta-conversion] Meta API error", res.status, json);
        return { success: false, reason: "api_error" as const, status: res.status };
      }
      return { success: true, response: json };
    } catch (e) {
      console.error("[meta-conversion] request failed", e);
      return { success: false, reason: "exception" as const };
    }
  });
