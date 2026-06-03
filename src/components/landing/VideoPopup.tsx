import { useEffect, useState } from "react";
import { ASSETS } from "@/lib/assets";
import type { Lang } from "@/lib/i18n";
import { I18N } from "@/lib/i18n";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { trackButtonClick } from "@/lib/tracking";
import buttonImg from "@/assets/BoutonNew.png.asset.json";

interface Props {
  lang: Lang;
}

export function VideoPopup({ lang }: Props) {
  const t = I18N[lang].hero;
  const { data: settings } = useSiteSettings();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setOpen(true), 1000);
    return () => window.clearTimeout(id);
  }, []);

  if (!open) return null;

  const ctaUrl =
    settings?.hero_cta_url && settings.hero_cta_url !== "#"
      ? settings.hero_cta_url
      : ASSETS.ctaLink;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-[90vw] max-w-[800px] aspect-[800/450] rounded-xl overflow-hidden shadow-2xl bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={ASSETS.popupVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />

        {/* Close button */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {/* CTA at bottom, not blocking video view */}
        <div className="absolute left-0 right-0 bottom-4 flex justify-center pointer-events-none">
          <a
            href={ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => void trackButtonClick("popup-cta")}
            className="pointer-events-auto group inline-block"
            aria-label={t.cta}
          >
            <span
              className="relative block w-[440px] md:w-[640px] max-w-[88vw] animate-cta-breathe"
              style={{ aspectRatio: "1634 / 300" }}
            >
              <img
                src={buttonImg.url}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
                style={{ filter: "drop-shadow(0 6px 14px oklch(0 0 0 / 0.45)) drop-shadow(0 0 18px oklch(0.72 0.19 50 / 0.45))" }}
                draggable={false}
              />
              <span
                className="absolute pointer-events-none overflow-hidden"
                style={{
                  top: "29.3%",
                  bottom: "21.7%",
                  left: "20.6%",
                  right: "17%",
                  background:
                    "linear-gradient(110deg, transparent 30%, oklch(1 0 0 / 0.45) 50%, transparent 70%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 3s linear infinite",
                  mixBlendMode: "screen",
                }}
              />
              <span
                className="absolute flex items-center justify-center font-bold text-white uppercase pointer-events-none"
                style={{
                  top: "29.3%",
                  bottom: "21.7%",
                  left: "20.6%",
                  right: "17%",
                  letterSpacing: "0.1em",
                  fontFamily: "var(--font-display)",
                  textShadow: "0 2px 8px oklch(0 0 0 / 0.55)",
                }}
              >
                <span className="text-[10px] md:text-sm lg:text-base whitespace-nowrap">{t.cta}</span>
              </span>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
