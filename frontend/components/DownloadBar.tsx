"use client";

import { useEffect } from "react";
import { localizeError, useLang, useT } from "@/lib/i18n";

export interface DownloadJob {
  id: number;
  filename: string;
  status: "downloading" | "complete" | "error" | "cancelled";
  received: number;
  total: number | null;
  percent: number | null;
  largeFile: boolean;
  error?: string;
}

interface Props {
  job: DownloadJob;
  onCancel: () => void;
  onDismiss: () => void;
}

function mb(bytes: number): string {
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

// Bottom-center progress toast for fetch-streamed downloads — the browser's
// own download bar never shows for blob saves, so this is the user's signal.
export default function DownloadBar({ job, onCancel, onDismiss }: Props) {
  const t = useT();
  const lang = useLang();
  const downloading = job.status === "downloading";

  useEffect(() => {
    if (job.status === "complete") {
      const timer = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timer);
    }
    if (job.status === "cancelled") {
      const timer = setTimeout(onDismiss, 2000);
      return () => clearTimeout(timer);
    }
  }, [job.status, onDismiss]);

  const name = job.filename.length > 32 ? `${job.filename.slice(0, 32)}…` : job.filename;
  const title =
    job.status === "complete"
      ? t.downloadComplete
      : job.status === "cancelled"
        ? t.cancelled
        : job.status === "error"
          ? t.downloadError
          : name;

  return (
    <div role="status" className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 animate-fade-up">
      <div className="glass w-full max-w-120 rounded-2xl px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3">
          <StatusIcon status={job.status} />
          <p className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</p>
          <button
            type="button"
            onClick={downloading ? onCancel : onDismiss}
            aria-label={downloading ? t.cancel : t.dismiss}
            className="shrink-0 p-1 text-white/50 transition-colors hover:text-white/90"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="h-4 w-4"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-3 h-1 w-full overflow-hidden rounded-xs bg-white/10">
          {downloading && job.percent === null ? (
            <div className="scan-track h-full">
              <div
                className="scan-bar h-full w-1/3 rounded-xs"
                style={{ backgroundImage: "linear-gradient(90deg, #4F8CFF, #8B5CF6)" }}
              />
            </div>
          ) : (
            <div
              className="h-full rounded-xs transition-[width] duration-300 ease-out"
              style={{
                width: `${job.status === "complete" ? 100 : (job.percent ?? 0)}%`,
                backgroundImage: "linear-gradient(90deg, #4F8CFF, #8B5CF6)",
              }}
            />
          )}
        </div>

        {downloading && (
          <div className="mt-2 flex items-center justify-between font-mono text-xs text-white/50">
            {job.received === 0 ? (
              <span>{t.preparing}</span>
            ) : job.total ? (
              <span dir="ltr">
                {mb(job.received)} / {mb(job.total)}
              </span>
            ) : (
              <span>
                <span dir="ltr">{mb(job.received)}</span> {t.received}
              </span>
            )}
            {job.percent !== null && <span dir="ltr">{job.percent}%</span>}
          </div>
        )}

        {downloading && job.largeFile && (
          <p className="mt-2 text-xs text-white/45">{t.largeFile}</p>
        )}

        {job.status === "error" && job.error && (
          <p className="mt-2 text-xs text-alarm">{localizeError(job.error, lang)}</p>
        )}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: DownloadJob["status"] }) {
  if (status === "complete") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="h-4 w-4 shrink-0 text-mint"
        aria-hidden
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }
  if (status === "error") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="h-4 w-4 shrink-0 text-alarm"
        aria-hidden
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4m0 4h.01" />
      </svg>
    );
  }
  if (status === "cancelled") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="h-4 w-4 shrink-0 text-white/50"
        aria-hidden
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="h-4 w-4 shrink-0 animate-spin text-electric"
      aria-hidden
    >
      <path d="M21 12a9 9 0 1 1-9-9" />
    </svg>
  );
}
