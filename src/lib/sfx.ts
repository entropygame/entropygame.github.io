/**
 * Tiny SFX helper.
 *
 * Why this exists:
 *  - Browsers block `audio.play()` until the user has interacted with the page
 *    (autoplay policy). On `mouseenter` BEFORE any click, `play()` rejects.
 *  - On GitHub Pages (different origin / fresh tab), this is more strict than
 *    inside the Lovable preview iframe where the user has usually already
 *    clicked.
 *
 * Strategy:
 *  - Pre-create one HTMLAudioElement per sound URL (cached).
 *  - On the first user gesture (pointerdown / keydown / touchstart), do a
 *    silent "unlock" play+pause on every cached audio so subsequent hover
 *    plays are allowed.
 *  - `playSfx(url)` clones playback by resetting currentTime; swallow any
 *    rejection so we never throw or log noisy errors.
 */

const cache = new Map<string, HTMLAudioElement>();
let unlocked = false;
let unlockBound = false;

function getAudio(url: string): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  let a = cache.get(url);
  if (!a) {
    a = new Audio(url);
    a.preload = "auto";
    a.crossOrigin = "anonymous";
    cache.set(url, a);
  }
  return a;
}

function unlockAll() {
  if (unlocked) return;
  unlocked = true;
  cache.forEach((a) => {
    const prevVol = a.volume;
    a.volume = 0;
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
      a.pause();
      a.currentTime = 0;
      a.volume = prevVol;
    }
  });
}

function bindUnlockOnce() {
  if (unlockBound || typeof window === "undefined") return;
  unlockBound = true;
  const handler = () => {
    unlockAll();
    window.removeEventListener("pointerdown", handler);
    window.removeEventListener("keydown", handler);
    window.removeEventListener("touchstart", handler);
  };
  window.addEventListener("pointerdown", handler, { once: true });
  window.addEventListener("keydown", handler, { once: true });
  window.addEventListener("touchstart", handler, { once: true });
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
        /* autoplay blocked — silently ignore */
      });
    }
  } catch {
    /* ignore */
  }
  bindUnlockOnce();
}
