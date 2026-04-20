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

  // Slightly smaller in floating mode so it doesn't dominate the viewport
  const widthClass = floating
    ? "w-[260px] md:w-[300px]"
    : "w-[320px] md:w-[400px] lg:w-[460px]";

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
        style={{ aspectRatio: "1518 / 970" }}
      >
        {/* Button artwork */}
        <img
          src={ctaButtonImg}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
          draggable={false}
        />

        {/* Shimmer sweep over the central plate area */}
        <span
          className="absolute pointer-events-none overflow-hidden"
          style={{
            // Position roughly over the dark central plate of the artwork
            top: "38%",
            bottom: "30%",
            left: "22%",
            right: "18%",
            borderRadius: "6px",
          }}
        >
          <span
            className="absolute inset-0 opacity-80"
            style={{
              background:
                "linear-gradient(110deg, transparent 30%, oklch(1 0 0 / 0.45) 50%, transparent 70%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 3s linear infinite",
              mixBlendMode: "screen",
            }}
          />
        </span>

        {/* Label — centered on the dark plate of the button */}
        <span
          className="absolute inset-0 flex items-center justify-center text-white font-bold uppercase pointer-events-none"
          style={{
            // Shift right to clear the octagonal icon on the left, and slightly up to sit on the plate
            paddingLeft: "14%",
            paddingRight: "10%",
            paddingBottom: "6%",
            fontSize: floating ? "0.85rem" : "1rem",
            letterSpacing: "0.22em",
            fontFamily: "var(--font-display)",
            textShadow:
              "0 0 8px oklch(0.78 0.2 245 / 0.9), 0 0 18px oklch(0.6 0.24 260 / 0.7), 0 2px 4px oklch(0 0 0 / 0.8)",
          }}
        >
          {t.cta}
        </span>
      </span>
    </a>
  );
}
