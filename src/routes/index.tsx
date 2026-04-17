import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ASSETS } from "@/lib/assets";
import { detectLang, isWindowsDesktop, type Lang } from "@/lib/i18n";
import { HeroSection } from "@/components/landing/HeroSection";
import { CarouselSection } from "@/components/landing/CarouselSection";
import { OperatorsSection } from "@/components/landing/OperatorsSection";
import { GoSection } from "@/components/landing/GoSection";
import { FloatingCTA } from "@/components/landing/FloatingCTA";
import { FallbackScreen } from "@/components/landing/FallbackScreen";
import { I18N } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Project Entropy — AAA Launch 2026" },
      { name: "description", content: "Step beyond the fracture. A spectral conflict where every choice rewrites reality. Windows desktop only." },
      { property: "og:title", content: "Project Entropy — AAA Launch 2026" },
      { property: "og:description", content: "Step beyond the fracture. A spectral conflict where every choice rewrites reality." },
      { property: "og:image", content: ASSETS.hero.webp },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: ASSETS.hero.webp },
    ],
  }),
});

function Index() {
  const [lang, setLang] = useState<Lang>("en");
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [isFloating, setIsFloating] = useState(false);
  const [heroRect, setHeroRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const heroAnchorRef = useRef<HTMLDivElement | null>(null);

  // Init lang + platform check (client-only)
  useEffect(() => {
    setLang(detectLang());
    setAllowed(isWindowsDesktop());
  }, []);

  // Track hero anchor position + scroll for CTA logic
  useEffect(() => {
    if (allowed !== true) return;

    const updateAnchor = () => {
      const el = document.getElementById("hero-cta-anchor");
      if (el) {
        heroAnchorRef.current = el as HTMLDivElement;
        const r = el.getBoundingClientRect();
        setHeroRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      }
    };

    const onScroll = () => {
      const heroEl = document.getElementById("hero");
      if (!heroEl) return;
      const heroBottom = heroEl.getBoundingClientRect().bottom;
      // Float when hero is mostly out of view
      setIsFloating(heroBottom < 120);
      updateAnchor();
    };

    updateAnchor();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateAnchor);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateAnchor);
    };
  }, [allowed]);

  if (allowed === null) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!allowed) {
    return <FallbackScreen lang={lang} />;
  }

  const fixedBgStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(oklch(0.05 0.03 265 / 0.85), oklch(0.05 0.03 265 / 0.92)), url(${ASSETS.fixedBg.webp})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  };

  return (
    <div className="relative bg-background text-foreground">
      <HeroSection lang={lang} />

      {/* Sections 2-4 share the fixed background */}
      <div style={fixedBgStyle} className="relative">
        <CarouselSection lang={lang} />
        <OperatorsSection lang={lang} />
        <GoSection lang={lang} />

        <footer className="relative z-10 py-8 text-center text-[11px] tracking-[0.25em] uppercase text-muted-foreground/70">
          {I18N[lang].footer}
        </footer>
      </div>

      <FloatingCTA lang={lang} isFloating={isFloating} heroRect={heroRect} />
    </div>
  );
}
