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
  if (!res.ok) throw await errorFromResponse(res);
  return res.json();
}

// Streams /download via fetch so the UI can show real progress, then saves
// the assembled Blob through a temporary anchor. The whole file is held in
// memory until saved — acceptable for this app's file sizes.
export async function downloadFile(
  url: string,
  formatId: string,
  type: "mp4" | "mp3",
  filename: string,
  signal: AbortSignal,
  onProgress: (received: number, total: number | null, percent: number | null) => void,
): Promise<void> {
  const downloadUrl = `${API_URL}/download?url=${encodeURIComponent(url)}&format_id=${encodeURIComponent(formatId)}&type=${type}`;
  let res: Response;
  try {
    res = await fetch(downloadUrl, { signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError("Can't reach the download server — is it running?", 0);
  }
  if (!res.ok) throw await errorFromResponse(res);

  const contentType =
    res.headers.get("Content-Type") || (type === "mp4" ? "video/mp4" : "audio/mpeg");
  const totalHeader = Number(res.headers.get("Content-Length"));
  const total = Number.isFinite(totalHeader) && totalHeader > 0 ? totalHeader : null;

  let blob: Blob;
  if (res.body) {
    const reader = res.body.getReader();
    const chunks: BlobPart[] = [];
    let received = 0;
    for (;;) {
      // Rejects with AbortError when the controller is aborted mid-stream.
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      onProgress(
        received,
        total,
        total ? Math.min(100, Math.round((received / total) * 100)) : null,
      );
    }
    blob = new Blob(chunks, { type: contentType });
  } else {
    blob = await res.blob();
  }
  saveBlob(blob, filename);
}

function saveBlob(blob: Blob, filename: string): void {
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
}

async function errorFromResponse(res: Response): Promise<ApiError> {
  let detail: unknown;
  try {
    detail = (await res.json())?.detail;
  } catch {
    // non-JSON error body
  }
  const message =
    STATUS_MESSAGES[res.status] ?? (typeof detail === "string" ? detail : GENERIC_ERROR);
  return new ApiError(message, res.status);
}
