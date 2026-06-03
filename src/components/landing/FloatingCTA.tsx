import { ASSETS } from "@/lib/assets";
import type { Lang } from "@/lib/i18n";
import { I18N } from "@/lib/i18n";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { trackButtonClick } from "@/lib/tracking";
import buttonImg from "@/assets/Bouton.png.asset.json";

interface Props {
  lang: Lang;
  floating?: boolean;
}

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
      className="z-50 group inline-block"
      style={fixedStyle}
      aria-label={t.cta}
    >
      <span
        className="relative block w-[420px] md:w-[560px] max-w-[88vw] animate-cta-breathe"
        style={{ aspectRatio: "1920 / 290" }}
      >
        <img
          src={buttonImg.url}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none drop-shadow-[0_0_24px_oklch(0.72_0.19_50/0.55)]"
          draggable={false}
        />
        {/* shimmer constrained to the orange bar area */}
        <span
          className="absolute pointer-events-none overflow-hidden"
          style={{
            top: "18%",
            bottom: "18%",
            left: "24%",
            right: "10%",
            borderRadius: "9999px",
            background:
              "linear-gradient(110deg, transparent 30%, oklch(1 0 0 / 0.45) 50%, transparent 70%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 3s linear infinite",
            mixBlendMode: "screen",
          }}
        />
        {/* Text overlay centered in the orange bar */}
        <span
          className="absolute inset-0 flex items-center justify-center font-bold text-white uppercase pointer-events-none"
          style={{
            letterSpacing: "0.22em",
            fontFamily: "var(--font-display)",
            paddingLeft: "22%",
            paddingRight: "10%",
            textShadow: "0 2px 8px oklch(0 0 0 / 0.45)",
          }}
        >
          <span className="text-base md:text-2xl whitespace-nowrap">{t.cta}</span>
        </span>
      </span>
    </a>
  );
}
