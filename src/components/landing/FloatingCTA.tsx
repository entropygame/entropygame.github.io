import { ASSETS } from "@/lib/assets";
import type { Lang } from "@/lib/i18n";
import { I18N } from "@/lib/i18n";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { trackButtonClick } from "@/lib/tracking";
import ctaButtonImg from "@/assets/cta-button.png";

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
 * Uses the custom sci-fi button image as background, with localized label
 * rendered on top. Animation: zoom in/out + exaggerated drop-shadow glow.
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

  // Larger overall — inline CTA acts as the hero focal point
  const widthClass = floating
    ? "w-[340px] md:w-[400px]"
    : "w-[480px] md:w-[600px] lg:w-[700px]";

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
        className={`relative inline-block animate-cta-image-breathe ${widthClass}`}
        style={{ aspectRatio: "1920 / 1010" }}
      >
        {/* Button artwork */}
        <img
          src={ctaButtonImg}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
          draggable={false}
        />

        {/* Shimmer sweep — confined to the dark plate (measured: x≈23%→78%, y≈37%→58%) */}
        <span
          className="absolute pointer-events-none overflow-hidden"
          style={{
            top: "37%",
            bottom: "42%",
            left: "23%",
            right: "22%",
            borderRadius: "3px",
          }}
        >
          <span
            className="absolute inset-0 opacity-90"
            style={{
              background:
                "linear-gradient(110deg, transparent 25%, oklch(1 0 0 / 0.55) 50%, transparent 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2.6s linear infinite",
              mixBlendMode: "screen",
            }}
          />
        </span>

        {/* Label — perfectly centered on the dark plate.
            containerType makes cqw resolve to this box, so the font auto-fits
            the plate width regardless of language length (DE/PT/RU). */}
        <span
          className="absolute flex items-center justify-center text-white font-bold uppercase pointer-events-none text-center"
          style={{
            top: "37%",
            bottom: "42%",
            left: "23%",
            right: "22%",
            containerType: "inline-size",
          }}
        >
          <span
            style={{
              fontSize: floating
                ? "clamp(0.6rem, 9cqw, 1rem)"
                : "clamp(0.8rem, 11cqw, 1.6rem)",
              letterSpacing: "0.16em",
              fontFamily: "var(--font-display)",
              whiteSpace: "nowrap",
              lineHeight: 1,
              textShadow:
                "0 0 8px oklch(0.78 0.2 245 / 0.95), 0 0 20px oklch(0.6 0.24 260 / 0.75), 0 2px 4px oklch(0 0 0 / 0.85)",
            }}
          >
            {t.cta}
          </span>
        </span>
      </span>
    </a>
  );
}
