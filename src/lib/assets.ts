export const ASSETS = {
  fixedBg: "https://cdn.digivadz.com/back%20ground%20fixe.webp",
  hero: {
    video: "https://cdn.digivadz.com/Video%20Background%20Hero%20Section%201.mp4",
    poster: "https://cdn.digivadz.com/BackGround%20Hero%20Section.webp",
  },
  logo: "https://cdn.digivadz.com/Logo%20Entropy.webp",
  slides: [1, 2, 3, 4, 5].map(
    (n) => ({ mp4: `https://cdn.digivadz.com/Slides/New%20Slides%20Compressed/Slide%20${n}.mp4` }),
  ),
  operators: [1, 2, 3, 4].map((n) => ({
    image: `https://cdn.digivadz.com/Joueurs/Joueur${n}.webp`,
    mp4: `https://cdn.digivadz.com/Joueurs/Joueur${n}.mp4`,
  })),
  popupVideo: "https://cdn.digivadz.com/Video%20popup.mp4",
  go: "https://cdn.digivadz.com/Go_section.webp",
  goBtn: "https://cdn.digivadz.com/Go_boutton.webp",
  ctaLink: "https://to.offerfor-all.com/u?k=220e77cdef8b42929dd5c06ff71b4ae5&via=5326",
};
