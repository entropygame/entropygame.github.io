export type Lang = 'en' | 'de' | 'ru' | 'fr' | 'es';

const translations: Record<Lang, {
  headline: string;
  subheadline: string;
  cta: string;
  platform: string;
  badge1: string;
  badge2: string;
  badge3: string;
  legal: string;
  windowsOnly: string;
}> = {
  en: {
    headline: "Command the Unknown. Conquer the Galaxy.",
    subheadline: "Explore uncharted planets. Recruit alien heroes. Build, fight, dominate.",
    cta: "Download Now",
    platform: "Available on Windows Desktop",
    badge1: "Grand Winner — Best Game 2026",
    badge2: "Players' Choice Award",
    badge3: "Windows Desktop Only",
    legal: "© 2026 Project Entropy. All rights reserved. All trademarks belong to their respective owners.",
    windowsOnly: "This experience is available on Windows desktop only.",
  },
  de: {
    headline: "Befehle das Unbekannte. Erobere die Galaxie.",
    subheadline: "Erforsche unbekannte Planeten. Rekrutiere Alien-Helden. Baue, kämpfe, dominiere.",
    cta: "Jetzt herunterladen",
    platform: "Verfügbar für Windows Desktop",
    badge1: "Hauptgewinner — Bestes Spiel 2026",
    badge2: "Spielerwahl-Auszeichnung",
    badge3: "Nur für Windows Desktop",
    legal: "© 2026 Project Entropy. Alle Rechte vorbehalten. Alle Marken gehören ihren jeweiligen Eigentümern.",
    windowsOnly: "Dieses Erlebnis ist nur auf Windows-Desktops verfügbar.",
  },
  ru: {
    headline: "Покоряй неизведанное. Завоюй галактику.",
    subheadline: "Исследуй неизвестные планеты. Вербуй инопланетных героев. Строй, сражайся, доминируй.",
    cta: "Скачать сейчас",
    platform: "Доступно на Windows",
    badge1: "Гран-при — Лучшая игра 2026",
    badge2: "Выбор игроков",
    badge3: "Только Windows",
    legal: "© 2026 Project Entropy. Все права защищены. Все торговые марки принадлежат их владельцам.",
    windowsOnly: "Этот опыт доступен только на настольных компьютерах с Windows.",
  },
  fr: {
    headline: "Commandez l'inconnu. Conquérez la galaxie.",
    subheadline: "Explorez des planètes inconnues. Recrutez des héros aliens. Construisez, combattez, dominez.",
    cta: "Télécharger",
    platform: "Disponible sur Windows Desktop",
    badge1: "Grand gagnant — Meilleur jeu 2026",
    badge2: "Prix du choix des joueurs",
    badge3: "Windows Desktop uniquement",
    legal: "© 2026 Project Entropy. Tous droits réservés. Toutes les marques appartiennent à leurs propriétaires respectifs.",
    windowsOnly: "Cette expérience est disponible uniquement sur Windows.",
  },
  es: {
    headline: "Comanda lo desconocido. Conquista la galaxia.",
    subheadline: "Explora planetas desconocidos. Recluta héroes alienígenas. Construye, lucha, domina.",
    cta: "Descargar ahora",
    platform: "Disponible en Windows Desktop",
    badge1: "Gran ganador — Mejor juego 2026",
    badge2: "Premio elección de jugadores",
    badge3: "Solo Windows Desktop",
    legal: "© 2026 Project Entropy. Todos los derechos reservados. Todas las marcas pertenecen a sus respectivos dueños.",
    windowsOnly: "Esta experiencia solo está disponible en Windows de escritorio.",
  },
};

export function detectLanguage(): Lang {
  const langs = navigator.languages ?? [navigator.language];
  for (const l of langs) {
    const code = l.substring(0, 2).toLowerCase();
    if (code === 'de') return 'de';
    if (code === 'ru') return 'ru';
    if (code === 'fr') return 'fr';
    if (code === 'es') return 'es';
  }
  return 'en';
}

export function t(lang: Lang) {
  return translations[lang];
}
