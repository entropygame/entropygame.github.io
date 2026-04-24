/**
 * Tiny SFX helper.
 *
 * Why this exists:
 *  - Browsers block `audio.play()` until the user has interacted with the page
 *    (autoplay policy). On `mouseenter` BEFORE any click, `play()` rejects.
 *  - On a fresh tab (e.g. published site opened in a new browser), the user
 *    has not yet interacted, so the very first hover sound is blocked until
 *    they click somewhere — or, on some systems, until they touch the volume
 *    which forces the browser to re-evaluate the audio context.
 *
 * Strategy:
 *  - Pre-create one HTMLAudioElement per sound URL (cached). No crossOrigin
 *    (assets are bundled same-origin; setting it can cause CORS-related play
 *    failures on some hosts).
 *  - On the FIRST real user gesture (click / pointerdown / keydown /
 *    touchstart / pointerup), do a real "unlock": call `play()` then
 *    immediately pause. We do NOT mute during unlock — muted unlock is
 *    unreliable on Chrome/Safari. Volume is briefly lowered to 0.01 instead.
 *  - Also resume a shared AudioContext as a belt-and-suspenders unlock signal.
 *  - `playSfx(url)` resets currentTime and plays; rejections are swallowed.
 */

const cache = new Map<string, HTMLAudioElement>();
let unlocked = false;
let unlockBound = false;
let sharedCtx: AudioContext | null = null;

function getAudio(url: string): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  let a = cache.get(url);
  if (!a) {
    a = new Audio(url);
    a.preload = "auto";
    // Do NOT set crossOrigin — bundled assets are same-origin, and setting it
    // can trigger spurious CORS failures on some CDNs/hosts.
    cache.set(url, a);
  }
  return a;
}

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (sharedCtx) return sharedCtx;
  const Ctor =
    (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  try {
    sharedCtx = new Ctor();
  } catch {
    sharedCtx = null;
  }
  return sharedCtx;
}

function unlockAll() {
  if (unlocked) return;
  unlocked = true;

  // Resume the shared AudioContext (some browsers gate HTMLAudio on this).
  const ctx = ensureCtx();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  cache.forEach((a) => {
    const prevVol = a.volume;
    // Use a near-silent (not fully muted) unlock: muted unlock is unreliable.
    a.volume = 0.01;
    const p = a.play();
    if (p && typeof p.then === "function") {
      p.then(() => {
        a.pause();
        a.currentTime = 0;
        a.volume = prevVol;
      }).catch(() => {
        a.volume = prevVol;
      });
    } else {
      try {
        a.pause();
        a.currentTime = 0;
      } catch {
        /* ignore */
      }
      a.volume = prevVol;
    }
  });
}

function bindUnlockOnce() {
  if (unlockBound || typeof window === "undefined") return;
  unlockBound = true;

  const events: Array<keyof WindowEventMap> = [
    "click",
    "pointerdown",
    "pointerup",
    "keydown",
    "touchstart",
    "touchend",
  ];

  const handler = () => {
    unlockAll();
    events.forEach((ev) => window.removeEventListener(ev, handler));
  };

  events.forEach((ev) =>
    window.addEventListener(ev, handler, { passive: true }),
  );
}

export function registerSfx(url: string, volume = 0.7): void {
  const a = getAudio(url);
  if (!a) return;
  a.volume = volume;
  bindUnlockOnce();
}

export function playSfx(url: string, volume = 0.7): void {
  const a = getAudio(url);
  if (!a) return;
  try {
    a.volume = volume;
    a.currentTime = 0;
    const p = a.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        /* autoplay blocked — silently ignore until first user gesture */
      });
    }
  } catch {
    /* ignore */
  }
  bindUnlockOnce();
}
