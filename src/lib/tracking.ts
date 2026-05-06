import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "entropy_session_id";
const SESSION_START_KEY = "entropy_session_start";
const SESSION_RECORDED_KEY = "entropy_session_recorded";

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = uuid();
    sessionStorage.setItem(SESSION_KEY, id);
    sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
    sessionStorage.removeItem(SESSION_RECORDED_KEY);
  }
  return id;
}

function parseUtm() {
  if (typeof window === "undefined")
    return { utm_source: null, utm_medium: null, utm_campaign: null };
  const url = new URL(window.location.href);
  return {
    utm_source: url.searchParams.get("utm_source"),
    utm_medium: url.searchParams.get("utm_medium"),
    utm_campaign: url.searchParams.get("utm_campaign"),
  };
}

/**
 * Records a visit session in a single insert when the page is being closed.
 * Uses sendBeacon-like flush via supabase. Idempotent for the current session.
 */
export function initVisitTracking() {
  if (typeof window === "undefined") return;
  const sessionId = getOrCreateSessionId();
  const startedAt = Number(sessionStorage.getItem(SESSION_START_KEY) || Date.now());
  const utm = parseUtm();
  const referrer = document.referrer || null;
  const landingPath = window.location.pathname;
  const ua = navigator.userAgent;

  const flush = async () => {
    if (sessionStorage.getItem(SESSION_RECORDED_KEY) === "1") return;
    sessionStorage.setItem(SESSION_RECORDED_KEY, "1");
    const endedAt = Date.now();
    const durationMs = endedAt - startedAt;
    try {
      await supabase.from("visit_sessions").insert({
        session_id: sessionId,
        started_at: new Date(startedAt).toISOString(),
        ended_at: new Date(endedAt).toISOString(),
        duration_ms: durationMs,
        referrer,
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
        landing_path: landingPath,
        user_agent: ua,
      });
    } catch (e) {
      console.warn("[tracking] flush failed", e);
    }
  };

  // Best-effort: fire on hide / pagehide / beforeunload
  const onHide = () => {
    void flush();
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") onHide();
  });
  window.addEventListener("pagehide", onHide);
  window.addEventListener("beforeunload", onHide);
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : undefined;
}

function getMetaPixelId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return document.querySelector<HTMLScriptElement>("script[data-meta-pixel-id]")?.dataset.metaPixelId;
}

function trackMetaBrowserEvent(eventName: string, eventId: string) {
  const fbq = typeof window !== "undefined" ? (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq : undefined;
  if (typeof fbq === "function") {
    fbq("track", eventName, {}, { eventID: eventId });
  }
}

async function sendMetaConversion(buttonId: string, sessionId: string, eventId: string) {
  try {
    await supabase.functions.invoke("meta-conversion", {
      body: {
        eventName: "Lead",
        eventId,
        pixelId: getMetaPixelId(),
        eventSourceUrl: typeof window !== "undefined" ? window.location.href : undefined,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        fbp: readCookie("_fbp"),
        fbc: readCookie("_fbc"),
      },
    });
  } catch (e) {
    console.warn("[tracking] meta conversion failed", e);
  }
}

export async function trackButtonClick(buttonId: string) {
  try {
    const sessionId = getOrCreateSessionId();
    const utm = parseUtm();
    const eventId = `${buttonId}-${sessionId}-${Date.now()}`;
    trackMetaBrowserEvent("Lead", eventId);
    await supabase.from("button_clicks").insert({
      button_id: buttonId,
      session_id: sessionId,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      utm_source: utm.utm_source,
      page_path: typeof window !== "undefined" ? window.location.pathname : null,
    });
    void sendMetaConversion(buttonId, sessionId, eventId);
  } catch (e) {
    console.warn("[tracking] click failed", e);
  }
}
