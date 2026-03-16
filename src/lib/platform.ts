export function isWindowsDesktop(): boolean {
  const ua = navigator.userAgent;
  const isWindows = /Windows NT/i.test(ua);
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(ua);
  return isWindows && !isMobile;
}

const VIDEO_PATHS = [
  '/videos/entropy-1.mp4',
  '/videos/entropy-2.mp4',
  '/videos/entropy-3.mp4',
];

export function getSessionVideo(): string {
  const key = 'entropy_video_idx';
  let idx = sessionStorage.getItem(key);
  if (idx === null) {
    idx = String(Math.floor(Math.random() * VIDEO_PATHS.length));
    sessionStorage.setItem(key, idx);
  }
  return VIDEO_PATHS[Number(idx)];
}
