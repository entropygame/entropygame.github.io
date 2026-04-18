import { useEffect, useRef } from "react";

/**
 * Lightweight canvas star field.
 *
 * Performance notes:
 * - Single <canvas> element, sized to its container with devicePixelRatio capped at 1.5.
 * - Stars are pre-generated once; the animation loop only updates alpha (no allocations).
 * - Pauses when offscreen (IntersectionObserver) and when the tab is hidden.
 * - Honors prefers-reduced-motion: renders a static frame with no RAF loop.
 * - Uses position:absolute + pointer-events:none so it never blocks the fixed bg or clicks.
 */
export function StarField({
  density = 0.00012, // stars per CSS pixel² — tuned for "dispersed" look
  className = "",
}: {
  density?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    type Star = {
      x: number;
      y: number;
      r: number;
      // twinkle params
      base: number; // base alpha 0..1
      amp: number; // alpha amplitude
      speed: number; // rad/ms
      phase: number;
      hue: number; // 0=white, 1=blue tint, 2=violet tint
    };

    let stars: Star[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let running = true;
    let visible = true;
    let rafId = 0;

    const rebuild = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(420, Math.max(60, Math.floor(width * height * density)));
      stars = new Array(count).fill(0).map(() => {
        const sizeRand = Math.random();
        // Mostly tiny, a few brighter accents
        const r = sizeRand < 0.85 ? 0.4 + Math.random() * 0.7 : 1.0 + Math.random() * 1.1;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          r,
          base: 0.25 + Math.random() * 0.45,
          amp: 0.25 + Math.random() * 0.45,
          speed: 0.0006 + Math.random() * 0.0018,
          phase: Math.random() * Math.PI * 2,
          hue: Math.random() < 0.7 ? 0 : Math.random() < 0.6 ? 1 : 2,
        };
      });
    };

    const colorFor = (hue: number, alpha: number) => {
      // Subtle galactic palette: white, soft blue, violet
      if (hue === 1) return `rgba(170, 200, 255, ${alpha})`;
      if (hue === 2) return `rgba(200, 170, 255, ${alpha})`;
      return `rgba(255, 255, 255, ${alpha})`;
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const a = Math.max(
          0,
          Math.min(1, s.base + Math.sin(t * s.speed + s.phase) * s.amp)
        );
        // Soft glow for the brighter stars only (cheap)
        if (s.r > 1) {
          ctx.fillStyle = colorFor(s.hue, a * 0.18);
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = colorFor(s.hue, a);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (t: number) => {
      if (!running || !visible) return;
      draw(t);
      rafId = requestAnimationFrame(loop);
    };

    rebuild();

    if (reduceMotion) {
      // Static frame, no RAF.
      draw(0);
    } else {
      rafId = requestAnimationFrame(loop);
    }

    // Resize observer (debounced via RAF)
    let resizePending = false;
    const ro = new ResizeObserver(() => {
      if (resizePending) return;
      resizePending = true;
      requestAnimationFrame(() => {
        resizePending = false;
        rebuild();
        if (reduceMotion) draw(0);
      });
    });
    ro.observe(canvas);

    // Pause when offscreen
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !reduceMotion && running) {
          cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(loop);
        }
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    // Pause on hidden tab
    const onVis = () => {
      running = !document.hidden;
      if (running && visible && !reduceMotion) {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
