import type { Platform } from "@/lib/platforms";

export interface VideoFormat {
  format_id: string;
  ext: "mp4" | "mp3";
  height?: number | null;
  abr?: number | null;
  filesize_approx?: number | null;
  label: string;
}

export interface VideoInfo {
  title: string;
  thumbnail: string | null;
  duration: number | null;
  platform: Platform;
  formats: VideoFormat[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const GENERIC_ERROR = "Something went wrong. Try again or paste a different link.";

// Canonical copy for statuses where the backend detail is too technical;
// 422 intentionally falls through to the backend's more specific message.
const STATUS_MESSAGES: Record<number, string> = {
  400: "That doesn't look like a valid video link.",
  403: "This video is private or age-restricted.",
  429: "Too many requests — wait a moment and try again.",
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchVideoInfo(url: string): Promise<VideoInfo> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/info?url=${encodeURIComponent(url)}`, {
      signal: AbortSignal.timeout(60_000),
    });
  } catch (err) {
    const timedOut = err instanceof DOMException && err.name === "TimeoutError";
    throw new ApiError(
      timedOut
        ? "The server took too long to respond — try again."
        : "Can't reach the download server — is it running?",
      0,
    );
  }
  if (!res.ok) {
    let detail: unknown;
    try {
      detail = (await res.json())?.detail;
    } catch {
      // non-JSON error body
    }
    const message =
      STATUS_MESSAGES[res.status] ?? (typeof detail === "string" ? detail : GENERIC_ERROR);
    throw new ApiError(message, res.status);
  }
  return res.json();
}

export function triggerDownload(
  url: string,
  formatId: string,
  type: "mp4" | "mp3",
  filename: string,
): void {
  const downloadUrl = `${API_URL}/download?url=${encodeURIComponent(url)}&format_id=${encodeURIComponent(formatId)}&type=${type}`;
  const anchor = document.createElement("a");
  anchor.href = downloadUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
