import type { Lang } from "@/lib/i18n";
import { I18N } from "@/lib/i18n";

export function FallbackScreen({ lang }: { lang: Lang }) {
  const t = I18N[lang].fallback;
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden px-6">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, oklch(0.2 0.08 265 / 0.5), oklch(0.05 0.03 265 / 0.95))",
        }}
      />
      <div className="ghost-presence" />
      <div className="relative z-10 text-center max-w-md animate-fade-up">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
            <path d="M3 5.5L11 4v8H3zM12 4l9-1.4V12h-9zM3 13h8v7L3 18.5zM12 13h9v8.4L12 20z"/>
          </svg>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gradient mb-4">{t.title}</h1>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{t.body}</p>
        <div className="mt-8 text-[10px] tracking-[0.3em] uppercase text-primary/70">Project Entropy</div>
      </div>
    </div>
  );
}
