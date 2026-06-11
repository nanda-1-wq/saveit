"use client";

import { useEffect } from "react";
import { useT } from "@/lib/i18n";

interface Props {
  filename: string;
  onDismiss: () => void;
}

// Bottom status bar shown when a download is handed to the browser — Chrome
// hides its own download UI for streamed files, so this is the user's signal.
export default function DownloadBar({ filename, onDismiss }: Props) {
  const t = useT();

  useEffect(() => {
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div role="status" className="fixed inset-x-0 bottom-0 z-50 animate-fade-up">
      <div className="glass-bar border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-5 py-3.5">
          <span
            aria-hidden
            className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-electric/30 border-t-electric"
          />
          <p className="min-w-0 flex-1 truncate text-sm">
            <span className="font-semibold">{filename}</span>{" "}
            <span className="text-white/65">— {t.downloadingNote}</span>
          </p>
          <button
            type="button"
            onClick={onDismiss}
            aria-label={t.dismiss}
            className="shrink-0 rounded-full border border-white/15 bg-white/10 p-1.5 text-white/65 transition hover:border-white/30 hover:text-white"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="h-3.5 w-3.5"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
