import { useEffect, useState } from "react";
import { ASSETS } from "@/lib/assets";
import { detectLang, type Lang } from "@/lib/i18n";
import { HeroSection } from "@/components/landing/HeroSection";
import { CarouselSection } from "@/components/landing/CarouselSection";
import { OperatorsSection } from "@/components/landing/OperatorsSection";
import { GoSection } from "@/components/landing/GoSection";
import { FloatingCTA } from "@/components/landing/FloatingCTA";
import { VideoPopup } from "@/components/landing/VideoPopup";
import { LanguageSwitcher } from "@/components/landing/LanguageSwitcher";
import { StarField } from "@/components/landing/StarField";
import { I18N, SUPPORTED_LANGS } from "@/lib/i18n";
import { initVisitTracking } from "@/lib/tracking";

const LANG_STORAGE_KEY = "pe_lang";

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [showFloating, setShowFloating] = useState(false);

  useEffect(() => {
    let initial: Lang | null = null;
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved && SUPPORTED_LANGS.includes(saved as Lang)) initial = saved as Lang;
    } catch {}
    setLang(initial ?? detectLang());
    initVisitTracking();
  }, []);

  const handleLangChange = (next: Lang) => {
    setLang(next);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {}
    if (typeof document !== "undefined") document.documentElement.lang = next;
  };

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const heroEl = document.getElementById("hero");
    if (!heroEl) return;
    const io = new IntersectionObserver(
      ([entry]) => setShowFloating(!entry.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px", threshold: 0 }
    );
    io.observe(heroEl);
    return () => io.disconnect();
  }, []);

  const fixedBgStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(oklch(0.05 0.03 265 / 0.85), oklch(0.05 0.03 265 / 0.92)), url(${ASSETS.fixedBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <div className="relative bg-background text-foreground">
      <LanguageSwitcher lang={lang} onChange={handleLangChange} />
      <HeroSection lang={lang} />

      <div style={fixedBgStyle} className="relative isolate overflow-hidden">
        <StarField className="z-0" />

        <div className="relative z-10">
          <CarouselSection lang={lang} />
          <OperatorsSection lang={lang} />
          <GoSection lang={lang} />

          <footer className="py-8 text-center text-[11px] tracking-[0.25em] uppercase text-muted-foreground/70">
            {I18N[lang].footer}
          </footer>
        </div>
      </div>

      {showFloating && <FloatingCTA lang={lang} floating />}
    </div>
  );
}
