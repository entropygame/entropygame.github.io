export type Lang = "en" | "zh" | "ru" | "de" | "fr" | "es" | "th" | "id" | "vi" | "pt";

export const SUPPORTED_LANGS: Lang[] = ["en", "zh", "ru", "de", "fr", "es", "th", "id", "vi", "pt"];

export const LANG_META: Record<Lang, { label: string; native: string; flag: string }> = {
  en: { label: "English", native: "English", flag: "🇬🇧" },
  zh: { label: "Chinese", native: "简体中文", flag: "🇨🇳" },
  ru: { label: "Russian", native: "Русский", flag: "🇷🇺" },
  de: { label: "German", native: "Deutsch", flag: "🇩🇪" },
  fr: { label: "French", native: "Français", flag: "🇫🇷" },
  es: { label: "Spanish", native: "Español", flag: "🇪🇸" },
  th: { label: "Thai", native: "ไทย", flag: "🇹🇭" },
  id: { label: "Indonesian", native: "Bahasa Indonesia", flag: "🇮🇩" },
  vi: { label: "Vietnamese", native: "Tiếng Việt", flag: "🇻🇳" },
  pt: { label: "Portuguese (Brazil)", native: "Português (BR)", flag: "🇧🇷" },
};

export function detectLang(): Lang {
  if (typeof navigator === "undefined") return "en";
  const list = (navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language]) as string[];
  for (const raw of list) {
    const lower = (raw || "").toLowerCase();
    const code = lower.split("-")[0];
    // Special handling: Chinese variants (zh, zh-CN, zh-Hans, zh-SG)
    if (code === "zh") return "zh";
    // Special handling: Portuguese (we support pt-BR primarily)
    if (code === "pt") return "pt";
    if (SUPPORTED_LANGS.includes(code as Lang)) return code as Lang;
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
  zh: {
    fallback: {
      title: "Windows 桌面专属体验",
      body: "《Project Entropy》目前仅在 Windows 桌面端提供。请使用兼容设备访问。",
    },
    hero: {
      eyebrow: "AAA — 2026 发售",
      headline: "Project Entropy",
      title: "征服未知",
      sub: "指挥舰队。招募外星英雄。为银河系最后的资源而战。",
      cta: "立即游玩",
      award1: "年度最佳游戏 2026",
      award2: "玩家票选大奖",
      platform: "仅限 Windows 桌面",
    },
    carousel: { title: "见证奇观", sub: "由实时引擎呈现的电影级瞬间。" },
    operators: { title: "选择你的干员", sub: "四位专家。同一命运。", hover: "悬停以揭示" },
    go: { title: "传送门已开启", sub: "你的熵之旅,即刻开始。", cta: "进入" },
    footer: "© 2026 Project Entropy。保留所有权利。",
  },
  ru: {
    fallback: {
      title: "Только для Windows",
      body: "Project Entropy в настоящее время доступен исключительно на настольных ПК с Windows. Пожалуйста, вернитесь с совместимого устройства.",
    },
    hero: {
      eyebrow: "AAA — Релиз 2026",
      headline: "Project Entropy",
      title: "Покорите неизведанное",
      sub: "Командуйте флотами. Вербуйте инопланетных героев. Сражайтесь за последние ресурсы галактики.",
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
  de: {
    fallback: {
      title: "Windows Desktop Erlebnis",
      body: "Project Entropy ist derzeit ausschließlich auf Windows Desktop verfügbar. Bitte kehren Sie von einem kompatiblen Gerät zurück.",
    },
    hero: {
      eyebrow: "AAA — Start 2026",
      headline: "Project Entropy",
      title: "Erobere das Unbekannte",
      sub: "Befehlige Flotten. Rekrutiere außerirdische Helden. Kämpfe um die letzten Ressourcen der Galaxie.",
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
  fr: {
    fallback: {
      title: "Expérience Windows Desktop",
      body: "Project Entropy est actuellement disponible exclusivement sur Windows Desktop. Merci de revenir depuis un appareil compatible.",
    },
    hero: {
      eyebrow: "AAA — Sortie 2026",
      headline: "Project Entropy",
      title: "Conquérir l'Inconnu",
      sub: "Commandez des flottes. Recrutez des héros aliens. Combattez pour les dernières ressources de la galaxie.",
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
      title: "Conquista lo Desconocido",
      sub: "Comanda flotas. Recluta héroes alienígenas. Lucha por los últimos recursos de la galaxia.",
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
  th: {
    fallback: {
      title: "ประสบการณ์เฉพาะ Windows Desktop",
      body: "Project Entropy เปิดให้บริการเฉพาะบน Windows Desktop เท่านั้น โปรดกลับมาเยี่ยมชมจากอุปกรณ์ที่รองรับ",
    },
    hero: {
      eyebrow: "AAA — เปิดตัว 2026",
      headline: "Project Entropy",
      title: "พิชิตสิ่งที่ไม่รู้จัก",
      sub: "บัญชาการกองเรือ คัดเลือกฮีโร่ต่างดาว ต่อสู้เพื่อทรัพยากรสุดท้ายของกาแล็กซี",
      cta: "เล่นเลย",
      award1: "ผู้ชนะใหญ่ — เกมยอดเยี่ยม 2026",
      award2: "รางวัลขวัญใจผู้เล่น",
      platform: "เฉพาะ Windows Desktop",
    },
    carousel: { title: "ชมความตระการตา", sub: "ช่วงเวลาภาพยนตร์ที่บันทึกด้วยเอนจินจริง" },
    operators: { title: "เลือกผู้ปฏิบัติการของคุณ", sub: "สี่ผู้เชี่ยวชาญ หนึ่งชะตากรรมร่วมกัน", hover: "เลื่อนเพื่อเปิดเผย" },
    go: { title: "ประตูมิติกำลังรอ", sub: "การก้าวเข้าสู่ Entropy ของคุณเริ่มต้นเดี๋ยวนี้", cta: "เข้าสู่" },
    footer: "© 2026 Project Entropy สงวนลิขสิทธิ์",
  },
  id: {
    fallback: {
      title: "Pengalaman Windows Desktop",
      body: "Project Entropy saat ini hanya tersedia di Windows Desktop. Silakan kembali dari perangkat yang kompatibel.",
    },
    hero: {
      eyebrow: "AAA — Rilis 2026",
      headline: "Project Entropy",
      title: "Taklukkan yang Tak Dikenal",
      sub: "Pimpin armada. Rekrut pahlawan alien. Berjuang untuk sumber daya terakhir galaksi.",
      cta: "Mainkan Sekarang",
      award1: "Pemenang Utama — Game Terbaik 2026",
      award2: "Penghargaan Pilihan Pemain",
      platform: "Hanya Windows Desktop",
    },
    carousel: { title: "Saksikan Spektakelnya", sub: "Momen sinematik ditangkap dalam mesin nyata." },
    operators: { title: "Pilih Operator Anda", sub: "Empat spesialis. Satu takdir bersama.", hover: "Arahkan untuk mengungkap" },
    go: { title: "Portal Menanti", sub: "Penyelamanmu ke dalam Entropy dimulai sekarang.", cta: "Masuk" },
    footer: "© 2026 Project Entropy. Semua hak dilindungi.",
  },
  vi: {
    fallback: {
      title: "Trải nghiệm Windows Desktop",
      body: "Project Entropy hiện chỉ khả dụng trên máy tính để bàn Windows. Vui lòng quay lại từ thiết bị tương thích.",
    },
    hero: {
      eyebrow: "AAA — Ra mắt 2026",
      headline: "Project Entropy",
      title: "Chinh Phục Điều Chưa Biết",
      sub: "Chỉ huy hạm đội. Tuyển mộ anh hùng ngoài hành tinh. Chiến đấu vì tài nguyên cuối cùng của thiên hà.",
      cta: "Chơi Ngay",
      award1: "Quán quân — Trò chơi Hay nhất 2026",
      award2: "Giải thưởng Lựa chọn của Người chơi",
      platform: "Chỉ Windows Desktop",
    },
    carousel: { title: "Chiêm ngưỡng kỳ quan", sub: "Khoảnh khắc điện ảnh được dựng bằng engine thực." },
    operators: { title: "Chọn Đặc vụ của bạn", sub: "Bốn chuyên gia. Một định mệnh chung.", hover: "Di chuột để hé lộ" },
    go: { title: "Cổng đang chờ", sub: "Hành trình vào Entropy của bạn bắt đầu ngay.", cta: "Vào" },
    footer: "© 2026 Project Entropy. Mọi quyền được bảo lưu.",
  },
  pt: {
    fallback: {
      title: "Experiência Windows Desktop",
      body: "Project Entropy está atualmente disponível exclusivamente no Windows Desktop. Por favor, retorne de um dispositivo compatível.",
    },
    hero: {
      eyebrow: "AAA — Lançamento 2026",
      headline: "Project Entropy",
      title: "Conquiste o Desconhecido",
      sub: "Comande frotas. Recrute heróis alienígenas. Lute pelos últimos recursos da galáxia.",
      cta: "Jogar Agora",
      award1: "Grande Vencedor — Melhor Jogo 2026",
      award2: "Prêmio Escolha dos Jogadores",
      platform: "Apenas Windows Desktop",
    },
    carousel: { title: "Contemple o espetáculo", sub: "Momentos cinematográficos capturados em engine real." },
    operators: { title: "Escolha seu Operador", sub: "Quatro especialistas. Um destino compartilhado.", hover: "Passe o mouse para revelar" },
    go: { title: "O portal aguarda", sub: "Sua descida na Entropia começa agora.", cta: "Entrar" },
    footer: "© 2026 Project Entropy. Todos os direitos reservados.",
  },
};
