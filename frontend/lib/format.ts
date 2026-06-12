function trimZeros(value: string): string {
  return value.replace(/\.0+$/, "");
}

// <1 GB → MB with 1 decimal ("320 MB"); ≥1 GB → GB with up to 2 decimals ("1.2 GB").
export function formatSize(bytes?: number | null): string | null {
  if (!bytes || bytes <= 0) return null;
  const GB = 1024 ** 3;
  const MB = 1024 ** 2;
  if (bytes >= GB) return `${trimZeros((bytes / GB).toFixed(2).replace(/0$/, ""))} GB`;
  return `${trimZeros((bytes / MB).toFixed(1))} MB`;
}

// Estimated MP3 size in MB: (seconds × kbps) / 8 / 1024.
export function estimateMp3Mb(
  durationSeconds?: number | null,
  bitrateKbps?: number | null,
): string | null {
  if (!durationSeconds || !bitrateKbps) return null;
  return trimZeros(((durationSeconds * bitrateKbps) / 8 / 1024).toFixed(1));
}

export function formatDuration(totalSeconds?: number | null): string | null {
  if (totalSeconds == null || !Number.isFinite(totalSeconds) || totalSeconds < 0) return null;
  const total = Math.round(totalSeconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const mm = hours ? String(minutes).padStart(2, "0") : String(minutes);
  return `${hours ? `${hours}:` : ""}${mm}:${String(seconds).padStart(2, "0")}`;
}

export function timeAgo(timestamp: number, lang: "en" | "ar" = "en"): string {
  const minutes = Math.floor((Date.now() - timestamp) / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (lang === "ar") {
    if (minutes < 1) return "الآن";
    if (minutes < 60) return `قبل ${minutes} د`;
    if (hours < 24) return `قبل ${hours} س`;
    if (days < 7) return `قبل ${days} ي`;
    return new Date(timestamp).toLocaleDateString();
  }
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
