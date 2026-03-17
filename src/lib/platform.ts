const SUPABASE_URL = "https://mfjjmawasinkzbiiruws.supabase.co";
const BUCKET = "videos";

export function isWindowsDesktop(): boolean {
  const ua = navigator.userAgent;
  const isWindows = /Windows NT/i.test(ua);
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(ua);
  return isWindows && !isMobile;
}

const VIDEO_NAMES = ["entropy-1", "entropy-2", "entropy-3"];

// Local fallback paths (used until videos are uploaded to Supabase)
function localPath(name: string, ext: string) {
  return `/videos/${name}.${ext}`;
}

function supabasePath(name: string, ext: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${name}.${ext}`;
}

export type VideoSources = {
  webm: string;
  mp4: string;
};

export function getSessionVideo(): VideoSources {
  const key = "entropy_video_idx";
  let idx = sessionStorage.getItem(key);
  if (idx === null) {
    idx = String(Math.floor(Math.random() * VIDEO_NAMES.length));
    sessionStorage.setItem(key, idx);
  }
  const name = VIDEO_NAMES[Number(idx)];
  return {
    webm: supabasePath(name, "webm"),
    mp4: supabasePath(name, "mp4"),
  };
}

// Fallback to local files if Supabase storage not yet populated
export function getSessionVideoLocal(): VideoSources {
  const key = "entropy_video_idx";
  let idx = sessionStorage.getItem(key);
  if (idx === null) {
    idx = String(Math.floor(Math.random() * VIDEO_NAMES.length));
    sessionStorage.setItem(key, idx);
  }
  const name = VIDEO_NAMES[Number(idx)];
  return {
    webm: localPath(name, "webm"),
    mp4: localPath(name, "mp4"),
  };
}

// All video files to upload
export const ALL_VIDEO_FILES = VIDEO_NAMES.flatMap((name) => [
  { name: `${name}.mp4`, localPath: `/videos/${name}.mp4` },
  { name: `${name}.webm`, localPath: `/videos/${name}.webm` },
]);
