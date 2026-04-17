import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ASSETS } from "@/lib/assets";
import { detectLang, isWindowsDesktop, type Lang } from "@/lib/i18n";
import { HeroSection } from "@/components/landing/HeroSection";
import { CarouselSection } from "@/components/landing/CarouselSection";
import { OperatorsSection } from "@/components/landing/OperatorsSection";
import { GoSection } from "@/components/landing/GoSection";
import { FloatingCTA } from "@/components/landing/FloatingCTA";
import { FallbackScreen } from "@/components/landing/FallbackScreen";
import { LanguageSwitcher } from "@/components/landing/LanguageSwitcher";
import { I18N, SUPPORTED_LANGS } from "@/lib/i18n";
import { initVisitTracking } from "@/lib/tracking";

const LANG_STORAGE_KEY = "pe_lang";

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
  const [showFloating, setShowFloating] = useState(false);

  // Init lang (saved override → browser detection) + platform check + tracking
  useEffect(() => {
    let initial: Lang | null = null;
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved && SUPPORTED_LANGS.includes(saved as Lang)) initial = saved as Lang;
    } catch {}
    setLang(initial ?? detectLang());
    setAllowed(isWindowsDesktop());
    initVisitTracking();
  }, []);

  const handleLangChange = (next: Lang) => {
    setLang(next);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {}
    if (typeof document !== "undefined") document.documentElement.lang = next;
  };

  // Keep <html lang> in sync
  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  // Toggle the bottom-right floating CTA only after the hero has scrolled out.
  // Uses IntersectionObserver → no per-frame scroll work, no layout thrash.
  useEffect(() => {
    if (allowed !== true) return;
    const heroEl = document.getElementById("hero");
    if (!heroEl) return;
    const io = new IntersectionObserver(
      ([entry]) => setShowFloating(!entry.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px", threshold: 0 }
    );
    io.observe(heroEl);
    return () => io.disconnect();
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
      <LanguageSwitcher lang={lang} onChange={handleLangChange} />
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

      {showFloating && <FloatingCTA lang={lang} floating />}
    </div>
  );
}
