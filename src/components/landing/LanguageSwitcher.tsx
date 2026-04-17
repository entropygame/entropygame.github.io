import { useEffect, useRef, useState } from "react";
import { LANG_META, SUPPORTED_LANGS, type Lang } from "@/lib/i18n";

interface Props {
  lang: Lang;
  onChange: (lang: Lang) => void;
}

export function LanguageSwitcher({ lang, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const current = LANG_META[lang];

  return (
    <div
      ref={ref}
      className="fixed top-5 right-5 z-[60]"
      style={{ fontFamily: "var(--font-display, inherit)" }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center gap-2 px-3.5 py-2 rounded-full glass border border-primary/20 hover:border-primary/50 transition-all shadow-[0_0_20px_oklch(0.55_0.22_285/0.15)] hover:shadow-[0_0_28px_oklch(0.55_0.22_285/0.35)]"
        aria-label="Select language"
        aria-expanded={open}
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="text-[11px] tracking-[0.18em] uppercase text-foreground/90 font-semibold">
          {lang}
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`text-primary/70 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div
        className={`absolute right-0 mt-2 min-w-[220px] rounded-xl glass border border-primary/20 shadow-[0_20px_60px_-10px_oklch(0.05_0.03_265/0.6)] overflow-hidden origin-top-right transition-all duration-200 ${
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="py-1 max-h-[60vh] overflow-y-auto">
          {SUPPORTED_LANGS.map((code) => {
            const meta = LANG_META[code];
            const active = code === lang;
            return (
              <button
                key={code}
                type="button"
                onClick={() => {
                  onChange(code);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  active
                    ? "bg-primary/15 text-foreground"
                    : "text-foreground/80 hover:bg-primary/10 hover:text-foreground"
                }`}
              >
                <span className="text-lg leading-none">{meta.flag}</span>
                <span className="flex-1 text-sm font-medium">{meta.native}</span>
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_oklch(0.72_0.2_245)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
