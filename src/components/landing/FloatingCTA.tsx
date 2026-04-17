import { useEffect, useRef, useState } from "react";
import { ASSETS } from "@/lib/assets";
import type { Lang } from "@/lib/i18n";
import { I18N } from "@/lib/i18n";

interface Props {
  lang: Lang;
  isFloating: boolean;
  heroRect: { top: number; left: number; width: number; height: number } | null;
}

/**
 * Single CTA element that physically translates from hero anchor to bottom-right.
 * Uses fixed positioning + transform with cubic-bezier glide.
 */
export function FloatingCTA({ lang, isFloating, heroRect }: Props) {
  const t = I18N[lang].hero;
  const ref = useRef<HTMLAnchorElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Floating target: bottom-right with margin
  const floatingStyle: React.CSSProperties = {
    position: "fixed",
    right: "28px",
    bottom: "28px",
    top: "auto",
    left: "auto",
    transform: "scale(0.82)",
    transformOrigin: "bottom right",
  };

  // Hero anchored: positioned over the hero anchor
  const heroStyle: React.CSSProperties = heroRect
    ? {
        position: "fixed",
        top: `${heroRect.top}px`,
        left: `${heroRect.left + heroRect.width / 2}px`,
        transform: "translateX(-50%) scale(1)",
        transformOrigin: "center center",
      }
    : {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%) scale(1)",
      };

  const style = isFloating ? floatingStyle : heroStyle;

  return (
    <a
      ref={ref}
      href={ASSETS.ctaLink}
      target="_blank"
      rel="noopener noreferrer"
      className="z-50 group inline-flex items-center justify-center"
      style={{
        ...style,
        transition: mounted
          ? "top 900ms cubic-bezier(0.22,1,0.36,1), left 900ms cubic-bezier(0.22,1,0.36,1), right 900ms cubic-bezier(0.22,1,0.36,1), bottom 900ms cubic-bezier(0.22,1,0.36,1), transform 900ms cubic-bezier(0.22,1,0.36,1)"
          : "none",
        willChange: "top, left, right, bottom, transform",
      }}
      aria-label={t.cta}
    >
      <span
        className="relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full text-sm font-semibold tracking-[0.2em] uppercase text-primary-foreground bg-gradient-cta shadow-cta animate-pulse-glow overflow-hidden"
      >
        {/* shimmer */}
        <span
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "linear-gradient(110deg, transparent 30%, oklch(1 0 0 / 0.25) 50%, transparent 70%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 3s linear infinite",
          }}
        />
        <span className="relative">{t.cta}</span>
        <svg className="relative w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    </a>
  );
}
