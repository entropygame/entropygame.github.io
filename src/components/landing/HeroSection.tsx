import { useEffect, useRef, useState } from "react";
import { ASSETS } from "@/lib/assets";
import type { Lang } from "@/lib/i18n";
import { I18N } from "@/lib/i18n";
import { FloatingCTA } from "./FloatingCTA";

interface Props {
  lang: Lang;
}

export function HeroSection({ lang }: Props) {
  const t = I18N[lang].hero;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onCanPlay = () => setVideoReady(true);
    v.addEventListener("loadeddata", onCanPlay);
    v.play().catch(() => {});
    return () => v.removeEventListener("loadeddata", onCanPlay);
  }, []);

  return (
    <section
      id="hero"
      className="relative w-full h-screen min-h-[640px] overflow-hidden"
    >
      {/* Fallback poster */}
      <picture className="absolute inset-0">
        <source srcSet={ASSETS.hero.webp} type="image/webp" />
        <img
          src={ASSETS.hero.png}
          alt=""
          className="w-full h-full object-cover object-center"
          aria-hidden
        />
      </picture>

      {/* Hero video — defer to keep first paint fast; poster covers the gap */}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${videoReady ? "opacity-100" : "opacity-0"}`}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        // @ts-expect-error fetchpriority is valid HTML
        fetchpriority="low"
        poster={ASSETS.hero.webp}
        style={{ objectPosition: "center 35%" }}
      >
        <source src={ASSETS.hero.video} type="video/mp4" />
      </video>

      {/* Readability + brand overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.05_0.03_265/0.55)] via-[oklch(0.05_0.03_265/0.35)] to-[oklch(0.05_0.03_265/0.85)]" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 35%, transparent 30%, oklch(0.05 0.03 265 / 0.6) 90%)" }} />

      {/* Subtle vignette glow */}
      <div className="absolute -inset-20 pointer-events-none opacity-50" style={{ background: "radial-gradient(circle at 20% 80%, oklch(0.55 0.22 285 / 0.18), transparent 50%), radial-gradient(circle at 80% 20%, oklch(0.72 0.2 245 / 0.15), transparent 55%)" }} />

      {/* Content — distributed across the full hero (= video) bounds */}
      <div className="relative z-10 h-full w-full flex flex-col items-center px-6 py-8 md:py-10 lg:py-12 animate-fade-up">
        {/* TOP — Logo */}
        <div className="flex-shrink-0">
          <picture>
            <source srcSet={ASSETS.logo.webp} type="image/webp" />
            <img
              src={ASSETS.logo.png}
              alt={t.headline}
              className="mx-auto h-24 md:h-32 lg:h-36 w-auto object-contain drop-shadow-[0_0_30px_oklch(0.72_0.2_245/0.6)]"
              width={400}
              height={140}
            />
          </picture>
        </div>

        {/* CENTER — Title + subtitle */}
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-5xl">
          <h1 className="title-3d-galaxy md:text-6xl lg:text-7xl mb-4 md:mb-6 px-2 text-8xl">
            {t.title}
          </h1>
          <p
            className="text-xs md:text-sm max-w-2xl mx-auto uppercase text-foreground/85 whitespace-pre-line mt-2 md:mt-3 mb-12 md:mb-16"
            style={{
              fontFamily: '"Michroma", "Orbitron", sans-serif',
              letterSpacing: "0.32em",
              lineHeight: 1.7,
              textShadow: "0 0 12px oklch(0.72 0.2 245 / 0.55), 0 0 28px oklch(0.55 0.22 285 / 0.35)",
            }}
          >
            {t.sub}
          </p>
        </div>

        {/* LOWER — CTA inline */}
        <div className="flex-shrink-0 mb-8 md:mb-10">
          <FloatingCTA lang={lang} />
        </div>

        {/* BOTTOM — Proof row pinned to bottom edge of video */}
        <div className="flex-shrink-0 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] tracking-[0.18em] uppercase text-foreground/70">
          <span className="flex items-center gap-2">
            <TrophyIcon /> {t.award1}
          </span>
          <span className="opacity-30">•</span>
          <span className="flex items-center gap-2">
            <StarIcon /> {t.award2}
          </span>
          <span className="opacity-30">•</span>
          <span className="flex items-center gap-2">
            <WindowsIcon /> {t.platform}
          </span>
        </div>
      </div>

      {/* Bottom edge fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-background pointer-events-none" />
    </section>
  );
}

function TrophyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6m12 5h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22m10 0c0-1.76-.85-3.25-2.03-3.79-.5-.23-.97-.66-.97-1.21v-2.34M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  );
}
function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.9 6.9L22 10l-5.5 4.8L18 22l-6-3.6L6 22l1.5-7.2L2 10l7.1-1.1z"/>
    </svg>
  );
}
function WindowsIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 5.5L11 4v8H3zM12 4l9-1.4V12h-9zM3 13h8v7L3 18.5zM12 13h9v8.4L12 20z"/>
    </svg>
  );
}
