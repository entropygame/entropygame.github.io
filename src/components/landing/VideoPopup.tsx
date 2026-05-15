import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ASSETS } from "@/lib/assets";
import type { Lang } from "@/lib/i18n";
import { I18N } from "@/lib/i18n";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { trackButtonClick } from "@/lib/tracking";

const VIDEO_URL = "https://cdn.digivadz.com/video%20pop%20up.mp4";

interface Props {
  lang: Lang;
}

export function VideoPopup({ lang }: Props) {
  const [open, setOpen] = useState(false);
  const t = I18N[lang].hero;
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!open) return null;

  const url =
    settings?.hero_cta_url && settings.hero_cta_url !== "#"
      ? settings.hero_cta_url
      : ASSETS.ctaLink;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <video
          className="w-full h-auto block bg-black"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>

        <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => void trackButtonClick("popup-cta")}
            className="pointer-events-auto group inline-flex items-center justify-center"
            aria-label={t.cta}
          >
            <span
              className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-cta shadow-cta overflow-hidden animate-cta-breathe uppercase"
              style={{ letterSpacing: "0.2em", fontFamily: "var(--font-display)" }}
            >
              <span
                className="absolute inset-0 opacity-70 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(110deg, transparent 30%, oklch(1 0 0 / 0.35) 50%, transparent 70%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 3s linear infinite",
                }}
              />
              <span className="relative text-sm">{t.cta}</span>
              <svg className="relative w-3.5 h-3.5 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
