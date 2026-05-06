// Supabase Edge Function: forwards events to Meta Conversions API server-side.
// Secret token stays on the server (never exposed to the browser).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha256Hex(value: string): Promise<string> {
  const buf = new TextEncoder().encode(value.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface Payload {
  eventName?: string;
  eventSourceUrl?: string;
  eventId?: string;
  pixelId?: string;
  userAgent?: string;
  email?: string;
  phone?: string;
  fbp?: string;
  fbc?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const token = Deno.env.get("META_CONVERSIONS_TOKEN")?.trim();
  const envPixelId = Deno.env.get("META_PIXEL_ID")?.trim();
  if (!token) {
    return new Response(
      JSON.stringify({ success: false, reason: "not_configured" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ success: false, reason: "bad_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const eventName = (body.eventName ?? "").toString().slice(0, 100);
  if (!eventName) {
    return new Response(JSON.stringify({ success: false, reason: "missing_event" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const bodyPixelId = body.pixelId?.toString().trim();
  const pixelId = /^\d{8,30}$/.test(envPixelId ?? "")
    ? envPixelId
    : /^\d{8,30}$/.test(bodyPixelId ?? "")
      ? bodyPixelId
      : null;

  if (!pixelId) {
    console.error("Meta Pixel ID is missing or invalid. Expected a numeric Pixel/Dataset ID.");
    return new Response(JSON.stringify({ success: false, reason: "invalid_pixel_id" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userData: Record<string, string> = {};
  if (body.email) userData.em = await sha256Hex(body.email);
  if (body.phone) userData.ph = await sha256Hex(body.phone.replace(/\D/g, ""));
  if (body.fbp) userData.fbp = body.fbp;
  if (body.fbc) userData.fbc = body.fbc;
  if (body.userAgent) userData.client_user_agent = body.userAgent.slice(0, 1000);
  const clientIp =
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (clientIp) userData.client_ip_address = clientIp;

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: body.eventId,
        event_source_url: body.eventSourceUrl,
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
      console.error("Meta API error", res.status, json);
      return new Response(
        JSON.stringify({ success: false, reason: "api_error", status: res.status, details: json }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    return new Response(JSON.stringify({ success: true, response: json }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("request failed", e);
    return new Response(JSON.stringify({ success: false, reason: "exception" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
