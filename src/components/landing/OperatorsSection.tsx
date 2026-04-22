import { useRef, useState } from "react";
import { ASSETS } from "@/lib/assets";
import type { Lang } from "@/lib/i18n";
import { I18N } from "@/lib/i18n";

interface Props {
  lang: Lang;
}

export function OperatorsSection({ lang }: Props) {
  const t = I18N[lang].operators;

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="ghost-presence" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <header className="text-center mb-10 animate-fade-up">
          <div className="text-[11px] tracking-[0.3em] uppercase text-primary/80 mb-3">— 03 —</div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-3">{t.title}</h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">{t.sub}</p>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {ASSETS.operators.map((op, i) => (
            <OperatorCard key={i} index={i} op={op} hoverLabel={t.hover} />
          ))}
        </div>
      </div>
    </section>
  );
}

function OperatorCard({
  index,
  op,
  hoverLabel,
}: {
  index: number;
  op: { webp: string; png: string; webm: string };
  hoverLabel: string;
}) {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const playClickSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Short filtered noise burst → mechanical "krop" click
      const bufferSize = Math.floor(ctx.sampleRate * 0.05);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.value = 2200;
      noiseFilter.Q.value = 1.4;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.06);

      // Low thud body for the "krop"
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.04);
      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.18, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);

      setTimeout(() => ctx.close().catch(() => {}), 200);
    } catch {
      // ignore
    }
  };

  const onEnter = () => {
    setHovered(true);
    playClickSound();
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  };
  const onLeave = () => {
    setHovered(false);
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  };

  return (
    <div
      className="relative aspect-[3/4] cursor-pointer group"
      style={{ perspective: "1500px" }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: "preserve-3d",
          transform: hovered ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* FRONT — image */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-card ring-1 ring-border"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.18_0.06_265)] to-[oklch(0.1_0.04_270)]" />
          <picture>
            <source srcSet={op.webp} type="image/webp" />
            <img
              src={op.png}
              alt={`Operator ${index + 1}`}
              className="absolute inset-0 w-full h-full object-contain object-bottom"
              loading="lazy"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="text-[10px] tracking-[0.3em] uppercase text-primary/80 mb-1">Operator 0{index + 1}</div>
            <div className="text-base font-semibold text-foreground">— Codename ENT-{index + 1}</div>
            <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-foreground/50">
              <span className="w-1 h-1 rounded-full bg-primary" /> {hoverLabel}
            </div>
          </div>
          <div className="absolute inset-0 ring-inset ring-1 ring-primary/10 rounded-2xl pointer-events-none group-hover:ring-primary/40 transition" />
        </div>

        {/* BACK — video (separate, distinct face) */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-card ring-1 ring-primary/40"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="absolute inset-0 bg-[oklch(0.08_0.03_265)]" />
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src={op.webm} type="video/webm" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-background/30" />
          <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[10px] tracking-[0.3em] uppercase text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Live
          </div>
          <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="text-[10px] tracking-[0.3em] uppercase text-primary/90 mb-1">Combat Profile</div>
            <div className="text-base font-semibold text-foreground">ENT-{index + 1}</div>
          </div>
          <div className="absolute inset-0 ring-inset ring-1 ring-primary/30 rounded-2xl pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
