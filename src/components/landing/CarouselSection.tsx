import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ASSETS } from "@/lib/assets";
import type { Lang } from "@/lib/i18n";
import { I18N } from "@/lib/i18n";

interface Props {
  lang: Lang;
}

const SLIDE_DURATION = 2000;

export function CarouselSection({ lang }: Props) {
  const t = I18N[lang].carousel;
  const slides = ASSETS.slides;
  const [active, setActive] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const timerRef = useRef<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Detect when section is in view to start autoplay only then
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setInView(e.isIntersecting);
      },
      { threshold: 0.25, rootMargin: "200px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Track if section has ever been near viewport (to mount videos lazily)
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (inView) setMounted(true);
  }, [inView]);

  // Initialize once videos are mounted: wait for first video metadata
  useEffect(() => {
    if (!mounted) return;
    const v = videoRefs.current[0];
    if (!v) return;
    if (v.readyState >= 2) {
      setInitialized(true);
      v.play().catch(() => {});
      return;
    }
    const onReady = () => {
      setInitialized(true);
      v.play().catch(() => {});
    };
    v.addEventListener("loadeddata", onReady, { once: true });
    // Force load since preload may be "none" on non-active until effect below sets it
    try { v.load(); } catch {}
    return () => v.removeEventListener("loadeddata", onReady);
  }, [mounted]);

  // Manage which video plays
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) {
        try { v.currentTime = 0; } catch {}
        const tryPlay = () => v.play().catch(() => {});
        if (v.readyState >= 2) {
          tryPlay();
        } else {
          v.preload = "auto";
          try { v.load(); } catch {}
          v.addEventListener("loadeddata", tryPlay, { once: true });
        }
      } else {
        v.pause();
      }
    });
  }, [active, mounted]);

  // Autoplay advance
  useEffect(() => {
    if (!initialized || !inView) return;
    timerRef.current = window.setTimeout(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [active, initialized, inView, slides.length]);

  const goTo = useCallback(
    (idx: number) => {
      setActive(((idx % slides.length) + slides.length) % slides.length);
    },
    [slides.length]
  );

  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  // Compute relative position for each slide
  const positions = useMemo(() => {
    return slides.map((_, i) => {
      let rel = i - active;
      const half = Math.floor(slides.length / 2);
      if (rel > half) rel -= slides.length;
      if (rel < -half) rel += slides.length;
      return rel;
    });
  }, [active, slides]);

  return (
    <section ref={sectionRef} className="relative py-20 overflow-hidden">
      <div className="ghost-presence" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <header className="text-center mb-10 animate-fade-up">
          <div className="text-[11px] tracking-[0.3em] uppercase text-primary/80 mb-3">— 02 —</div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-3">{t.title}</h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">{t.sub}</p>
        </header>

        <div className="relative h-[460px] md:h-[520px] flex items-center justify-center" style={{ perspective: "1800px" }}>
          {slides.map((s, i) => {
            const rel = positions[i];
            const abs = Math.abs(rel);
            const isCenter = rel === 0;
            const visible = abs <= 2;

            // Composition: center large, sides smaller and angled
            const translateX = rel * 280;
            const translateZ = -abs * 220;
            const rotateY = rel * -28;
            const scale = isCenter ? 1 : abs === 1 ? 0.78 : 0.6;
            const opacity = !visible ? 0 : isCenter ? 1 : abs === 1 ? 0.55 : 0.2;
            const zIndex = 10 - abs;

            return (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 transition-all duration-[900ms] ease-out"
                style={{
                  width: "min(820px, 70vw)",
                  height: "min(460px, 40vw)",
                  transform: `translate(-50%, -50%) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity,
                  zIndex,
                  pointerEvents: visible ? "auto" : "none",
                  transformStyle: "preserve-3d",
                }}
              >
                <div className={`relative w-full h-full rounded-2xl overflow-hidden shadow-card ${isCenter ? "ring-1 ring-primary/40 shadow-glow" : "ring-1 ring-border"}`}>
                  {mounted && (
                    <video
                      ref={(el) => { videoRefs.current[i] = el; }}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      preload={i === active ? "auto" : "none"}
                    >
                      <source src={s.mp4} type="video/mp4" />
                    </video>
                  )}
                  {!isCenter && (
                    <div className="absolute inset-0 bg-background/40" />
                  )}
                  <div className="absolute inset-0 ring-inset ring-1 ring-primary/10 rounded-2xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/80 to-transparent" />
                  {isCenter && (
                    <div className="absolute bottom-4 left-5 text-[10px] tracking-[0.3em] uppercase text-primary/90">
                      Sequence 0{i + 1} / 0{slides.length}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="mt-8 flex items-center justify-center gap-6">
          <button
            onClick={prev}
            className="w-11 h-11 rounded-full glass flex items-center justify-center text-foreground/70 hover:text-primary hover:border-primary/40 transition-colors"
            aria-label="Previous"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="group relative h-1.5 rounded-full overflow-hidden bg-foreground/15 transition-all"
                style={{ width: i === active ? 36 : 18 }}
                aria-label={`Go to slide ${i + 1}`}
              >
                {i === active && (
                  <span
                    key={`p-${active}`}
                    className="absolute inset-y-0 left-0 bg-gradient-cta"
                    style={{
                      width: "100%",
                      animation: `shimmer-bar ${SLIDE_DURATION}ms linear forwards`,
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={next}
            className="w-11 h-11 rounded-full glass flex items-center justify-center text-foreground/70 hover:text-primary hover:border-primary/40 transition-colors"
            aria-label="Next"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shimmer-bar { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      `}</style>
    </section>
  );
}
