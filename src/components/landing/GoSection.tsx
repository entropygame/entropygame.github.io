import { ASSETS } from "@/lib/assets";
import type { Lang } from "@/lib/i18n";
import { I18N } from "@/lib/i18n";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { trackButtonClick } from "@/lib/tracking";

interface Props {
  lang: Lang;
}

export function GoSection({ lang }: Props) {
  const t = I18N[lang].go;
  const { data: settings } = useSiteSettings();
  const goUrl =
    settings?.go_cta_url && settings.go_cta_url !== "#"
      ? settings.go_cta_url
      : ASSETS.ctaLink;

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="ghost-presence" />
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <header className="text-center mb-8 animate-fade-up">
          <div className="text-[11px] tracking-[0.3em] uppercase text-primary/80 mb-3">— 04 —</div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-3">{t.title}</h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">{t.sub}</p>
        </header>

        <div className="relative mx-auto rounded-3xl overflow-hidden shadow-glow ring-1 ring-primary/30" style={{ maxWidth: "1100px", aspectRatio: "16 / 9" }}>
          <picture>
            <source srcSet={ASSETS.go.webp} type="image/webp" />
            <img
              src={ASSETS.go.png}
              alt=""
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </picture>

          {/* readability overlay */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center bottom, oklch(0.05 0.03 265 / 0.55) 30%, transparent 70%)" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />

          {/* GO button — smaller, centered low so it doesn't cover heads */}
          <a
            href={goUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => void trackButtonClick("go-cta")}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group transition-transform duration-300 hover:scale-105"
            aria-label={t.cta}
          >
            <picture>
              <source srcSet={ASSETS.goBtn.webp} type="image/webp" />
              <img
                src={ASSETS.goBtn.png}
                alt={t.cta}
                className="w-[120px] md:w-[150px] lg:w-[170px] h-auto drop-shadow-[0_0_30px_oklch(0.72_0.2_245/0.7)] animate-pulse-glow rounded-full"
                loading="lazy"
              />
            </picture>
            <span className="sr-only">{t.cta}</span>
          </a>

          {/* corner accents */}
          <div className="absolute top-4 left-4 w-10 h-10 border-l border-t border-primary/50" />
          <div className="absolute top-4 right-4 w-10 h-10 border-r border-t border-primary/50" />
          <div className="absolute bottom-4 left-4 w-10 h-10 border-l border-b border-primary/50" />
          <div className="absolute bottom-4 right-4 w-10 h-10 border-r border-b border-primary/50" />
        </div>
      </div>
    </section>
  );
}
