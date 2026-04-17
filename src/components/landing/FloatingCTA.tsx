import { ASSETS } from "@/lib/assets";
import type { Lang } from "@/lib/i18n";
import { I18N } from "@/lib/i18n";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { trackButtonClick } from "@/lib/tracking";

interface Props {
  lang: Lang;
  /** When true, render as fixed bottom-right. When false, render inline (in flow). */
  floating?: boolean;
}

/**
 * CTA button. Two render modes:
 *  - inline (default): hero CTA, in document flow
 *  - floating: position: fixed bottom-right (after hero leaves viewport)
 *
 * URL is fetched dynamically from site_settings (admin-editable).
 * Falls back to ASSETS.ctaLink if settings not yet loaded.
 */
export function FloatingCTA({ lang, floating = false }: Props) {
  const t = I18N[lang].hero;
  const { data: settings } = useSiteSettings();

  const buttonId = floating ? "floating-cta" : "hero-cta";
  const url = floating
    ? settings?.floating_cta_url && settings.floating_cta_url !== "#"
      ? settings.floating_cta_url
      : ASSETS.ctaLink
    : settings?.hero_cta_url && settings.hero_cta_url !== "#"
      ? settings.hero_cta_url
      : ASSETS.ctaLink;

  const fixedStyle: React.CSSProperties | undefined = floating
    ? { position: "fixed", right: "28px", bottom: "28px" }
    : undefined;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => void trackButtonClick(buttonId)}
      className="z-50 group inline-flex items-center justify-center"
      style={fixedStyle}
      aria-label={t.cta}
    >
      <span
        className="relative inline-flex items-center gap-3 px-9 py-4 rounded-full text-base font-bold text-white bg-gradient-cta shadow-cta overflow-hidden animate-cta-breathe uppercase"
        style={{ letterSpacing: "0.22em", fontFamily: "var(--font-display)" }}
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
        <span className="relative">{t.cta}</span>
        <svg className="relative w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    </a>
  );
}
