export type Lang = "en" | "de" | "ru" | "fr" | "es";

export const SUPPORTED_LANGS: Lang[] = ["en", "de", "ru", "fr", "es"];

export function detectLang(): Lang {
  if (typeof navigator === "undefined") return "en";
  const list = (navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language]) as string[];
  for (const raw of list) {
    const code = (raw || "").toLowerCase().split("-")[0] as Lang;
    if (SUPPORTED_LANGS.includes(code)) return code;
  }
  return "en";
}

export function isWindowsDesktop(): boolean {
  if (typeof navigator === "undefined") return true;
  const ua = navigator.userAgent || "";
  const isWindows = /Windows NT/i.test(ua);
  const isMobile = /Mobi|Android|iPhone|iPad|iPod|Touch/i.test(ua);
  return isWindows && !isMobile;
}

type Dict = {
  fallback: { title: string; body: string };
  hero: {
    eyebrow: string;
    headline: string;
    title: string;
    sub: string;
    cta: string;
    award1: string;
    award2: string;
    platform: string;
  };
  carousel: { title: string; sub: string };
  operators: { title: string; sub: string; hover: string };
  go: { title: string; sub: string; cta: string };
  footer: string;
};

export const I18N: Record<Lang, Dict> = {
  en: {
    fallback: {
      title: "Windows Desktop Experience",
      body: "Project Entropy is currently available exclusively on Windows desktop. Please return from a compatible device.",
    },
    hero: {
      eyebrow: "AAA — 2026 Launch",
      headline: "Project Entropy",
      title: "Conquer the Unknown",
      sub: "Command fleets. Recruit alien heroes. Fight for the galaxy's last resources.",
      cta: "Play Now",
      award1: "Grand Winner — Best Game 2026",
      award2: "Players' Choice Award",
      platform: "Windows Desktop Only",
    },
    carousel: { title: "Behold the Spectacle", sub: "Cinematic moments captured in real engine." },
    operators: { title: "Choose Your Operator", sub: "Four specialists. One shared destiny.", hover: "Hover to reveal" },
    go: { title: "The Portal Awaits", sub: "Your descent into Entropy begins now.", cta: "Enter" },
    footer: "© 2026 Project Entropy. All rights reserved.",
  },
  de: {
    fallback: {
      title: "Windows Desktop Erlebnis",
      body: "Project Entropy ist derzeit ausschließlich auf Windows Desktop verfügbar. Bitte kehren Sie von einem kompatiblen Gerät zurück.",
    },
    hero: {
      eyebrow: "AAA — Start 2026",
      headline: "Project Entropy",
      sub: "Tritt jenseits des Bruchs. Ein spektraler Konflikt, in dem jede Wahl die Realität neu schreibt.",
      cta: "Jetzt Spielen",
      award1: "Hauptgewinner — Bestes Spiel 2026",
      award2: "Players' Choice Award",
      platform: "Nur Windows Desktop",
    },
    carousel: { title: "Erlebe das Spektakel", sub: "Kinoreife Momente in Echtzeit-Engine." },
    operators: { title: "Wähle deinen Operator", sub: "Vier Spezialisten. Ein gemeinsames Schicksal.", hover: "Zum Enthüllen schweben" },
    go: { title: "Das Portal erwartet dich", sub: "Dein Abstieg in die Entropie beginnt jetzt.", cta: "Eintreten" },
    footer: "© 2026 Project Entropy. Alle Rechte vorbehalten.",
  },
  ru: {
    fallback: {
      title: "Только для Windows",
      body: "Project Entropy в настоящее время доступен исключительно на настольных ПК с Windows. Пожалуйста, вернитесь с совместимого устройства.",
    },
    hero: {
      eyebrow: "AAA — Релиз 2026",
      headline: "Project Entropy",
      sub: "Шагните за грань разлома. Спектральный конфликт, где каждый выбор переписывает реальность.",
      cta: "Играть",
      award1: "Гран-при — Лучшая игра 2026",
      award2: "Выбор игроков",
      platform: "Только Windows Desktop",
    },
    carousel: { title: "Узрите зрелище", sub: "Кинематографичные моменты в реальном движке." },
    operators: { title: "Выберите оператора", sub: "Четыре специалиста. Одна общая судьба.", hover: "Наведите для раскрытия" },
    go: { title: "Портал ждёт", sub: "Ваше погружение в Энтропию начинается сейчас.", cta: "Войти" },
    footer: "© 2026 Project Entropy. Все права защищены.",
  },
  fr: {
    fallback: {
      title: "Expérience Windows Desktop",
      body: "Project Entropy est actuellement disponible exclusivement sur Windows Desktop. Merci de revenir depuis un appareil compatible.",
    },
    hero: {
      eyebrow: "AAA — Sortie 2026",
      headline: "Project Entropy",
      sub: "Franchissez la fracture. Un conflit spectral où chaque choix réécrit la réalité.",
      cta: "Jouer Maintenant",
      award1: "Grand Gagnant — Meilleur Jeu 2026",
      award2: "Prix du Choix des Joueurs",
      platform: "Windows Desktop Uniquement",
    },
    carousel: { title: "Contemplez le spectacle", sub: "Des moments cinématographiques capturés en moteur réel." },
    operators: { title: "Choisissez votre opérateur", sub: "Quatre spécialistes. Un destin partagé.", hover: "Survolez pour révéler" },
    go: { title: "Le portail vous attend", sub: "Votre descente dans l'Entropie commence maintenant.", cta: "Entrer" },
    footer: "© 2026 Project Entropy. Tous droits réservés.",
  },
  es: {
    fallback: {
      title: "Experiencia Windows Desktop",
      body: "Project Entropy está actualmente disponible exclusivamente en Windows Desktop. Por favor, regresa desde un dispositivo compatible.",
    },
    hero: {
      eyebrow: "AAA — Lanzamiento 2026",
      headline: "Project Entropy",
      sub: "Cruza la fractura. Un conflicto espectral donde cada elección reescribe la realidad.",
      cta: "Jugar Ahora",
      award1: "Gran Ganador — Mejor Juego 2026",
      award2: "Premio de los Jugadores",
      platform: "Solo Windows Desktop",
    },
    carousel: { title: "Contempla el espectáculo", sub: "Momentos cinematográficos capturados en motor real." },
    operators: { title: "Elige tu operador", sub: "Cuatro especialistas. Un destino compartido.", hover: "Pasa el cursor para revelar" },
    go: { title: "El portal te espera", sub: "Tu descenso en la Entropía comienza ahora.", cta: "Entrar" },
    footer: "© 2026 Project Entropy. Todos los derechos reservados.",
  },
};
