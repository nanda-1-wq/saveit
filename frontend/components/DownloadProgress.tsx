"use client";

import { useEffect, useState } from "react";
import Panel from "@/components/Panel";
import { timeAgo } from "@/lib/format";
import type { HistoryItem } from "@/lib/history";

interface Props {
  item: HistoryItem;
  canRepick: boolean;
  onRepick: () => void;
  onReset: () => void;
}

// The anchor-triggered download is opaque to JS, so this panel narrates the
// hand-off: a short "transferring" beat, then a done state with guidance.
export default function DownloadProgress({ item, canRepick, onRepick, onReset }: Props) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDone(true), 2600);
    return () => clearTimeout(timer);
  }, []);

  if (!done) {
    return (
      <Panel className="mt-6 animate-fade-up">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-signal">
          <span className="h-2 w-2 rounded-full bg-signal animate-blink" />
          handing off to your browser
        </p>
        <div className="scan-track mt-4 h-1 w-full bg-line">
          <div className="scan-bar h-full w-1/3 bg-signal" />
        </div>
        <p className="mt-4 font-mono text-xs leading-relaxed text-ash">
          The server is fetching and converting the file. Large videos can take a minute
          before your browser shows the save dialog.
        </p>
      </Panel>
    );
  }

  return (
    <Panel className="mt-6 animate-fade-up">
      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-mint">
        <span className="grid h-4 w-4 place-items-center bg-mint text-tar">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            className="h-2.5 w-2.5"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        sent to your browser
      </p>
      <div className="mt-4 flex items-center gap-3 border border-line bg-tar p-3">
        {item.thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element -- external CDN thumbnails, no optimizer
          <img
            src={item.thumbnail}
            alt=""
            referrerPolicy="no-referrer"
            className="h-12 w-20 shrink-0 border border-line object-cover"
          />
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{item.title}</p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-ash">
            {item.format} · {timeAgo(item.timestamp)}
          </p>
        </div>
      </div>
      <p className="mt-3 font-mono text-[11px] leading-relaxed text-ash">
        Nothing appeared? It may still be converting — give it a moment, then check your
        downloads folder.
      </p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        {canRepick && (
          <button
            type="button"
            onClick={onRepick}
            className="border border-line px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ash transition hover:border-ash hover:text-bone"
          >
            another quality
          </button>
        )}
        <button
          type="button"
          onClick={onReset}
          className="flex-1 bg-signal py-3 font-display text-sm font-bold tracking-wide text-tar transition hover:bg-ember"
        >
          GRAB ANOTHER LINK
        </button>
      </div>
    </Panel>
  );
}
