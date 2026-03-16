import { useMemo } from "react";
import { detectLanguage, t } from "@/lib/i18n";
import { isWindowsDesktop, getSessionVideo } from "@/lib/platform";
import logoEntropy from "@/assets/logo-entropy.png";
import { Trophy, Star, Monitor } from "lucide-react";

const POSTER = "/images/poster-fallback.jpg";

const Index = () => {
  const lang = useMemo(() => detectLanguage(), []);
  const strings = useMemo(() => t(lang), [lang]);
  const videoSrc = useMemo(() => getSessionVideo(), []);
  const isWindows = useMemo(() => isWindowsDesktop(), []);

  if (!isWindows) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${POSTER})` }}
        />
        <div className="relative z-10 text-center px-8 max-w-xl">
          <img
            src={logoEntropy}
            alt="Project Entropy"
            className="w-64 mx-auto mb-8 opacity-80"
          />
          <p className="font-display text-xl md:text-2xl tracking-wide text-foreground/80">
            {strings.windowsOnly}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      {/* Video background */}
      <video
        key={videoSrc}
        autoPlay
        muted
        loop
        playsInline
        poster={POSTER}
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Cinematic overlays */}
      <div
        className="absolute inset-0"
        style={{ background: "var(--overlay-heavy)" }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "var(--overlay-bottom)" }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between px-12 py-10 lg:px-20 lg:py-12">
        {/* Main content — centered */}
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-2xl animate-fade-in text-center">
            {/* Logo */}
            <img
              src={logoEntropy}
              alt="Project Entropy"
              className="w-72 lg:w-96 mb-6 drop-shadow-2xl mx-auto"
              loading="eager"
            />

            {/* Headline */}
            <h1 className="font-display font-bold text-3xl lg:text-5xl xl:text-[3.4rem] leading-tight tracking-wide text-foreground text-shadow-hero mb-3">
              {strings.headline}
            </h1>

            {/* Subheadline */}
            <p className="font-body text-base lg:text-lg text-muted-foreground tracking-wide mb-8 mx-auto max-w-lg">
              {strings.subheadline}
            </p>

            {/* CTA */}
            <button className="cta-glow font-display font-bold text-xl lg:text-2xl tracking-widest uppercase px-14 py-4 bg-gradient-to-b from-entropy-gold to-entropy-orange text-primary-foreground rounded-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring">
              {strings.cta}
            </button>

            {/* Platform line */}
            <p className="mt-4 text-xs tracking-wider uppercase text-muted-foreground/70 font-body flex items-center justify-center gap-1.5">
              <Monitor className="w-3.5 h-3.5" />
              {strings.platform}
            </p>

            {/* Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
              <Badge icon={<Trophy className="w-4 h-4 text-entropy-gold" />} text={strings.badge1} />
              <Badge icon={<Star className="w-4 h-4 text-entropy-cyan" />} text={strings.badge2} />
              <Badge icon={<Monitor className="w-4 h-4 text-muted-foreground" />} text={strings.badge3} />
            </div>
          </div>
        </div>

        {/* Legal footer */}
        <p className="text-[10px] text-muted-foreground/40 tracking-wide font-body">
          {strings.legal}
        </p>
      </div>
    </div>
  );
};

function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex items-center gap-2 text-xs tracking-wider uppercase text-foreground/60 font-body border border-border/40 rounded-sm px-3 py-1.5 bg-muted/20 backdrop-blur-sm">
      {icon}
      {text}
    </span>
  );
}

export default Index;
