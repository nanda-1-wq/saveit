"use client";

import { useEffect, useState } from "react";
import Panel from "@/components/Panel";
import { timeAgo } from "@/lib/format";
import type { HistoryItem } from "@/lib/history";
import { useLang, useT } from "@/lib/i18n";

interface Props {
  item: HistoryItem;
  canRepick: boolean;
  onRepick: () => void;
  onReset: () => void;
}

// The anchor-triggered download is opaque to JS, so this panel narrates the
// hand-off: a short "transferring" beat, then a done state with guidance.
export default function DownloadProgress({ item, canRepick, onRepick, onReset }: Props) {
  const t = useT();
  const lang = useLang();
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDone(true), 2600);
    return () => clearTimeout(timer);
  }, []);

  if (!done) {
    return (
      <Panel className="mt-6 animate-fade-up text-start">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-electric">
          <span className="h-2 w-2 rounded-full bg-electric animate-blink" />
          {t.handingOff}
        </p>
        <div className="scan-track mt-4 h-1.5 w-full rounded-full bg-white/10">
          <div className="scan-bar grad-primary h-full w-1/3 rounded-full" />
        </div>
        <p className="mt-4 font-mono text-xs leading-relaxed text-white/50">
          {t.serverConverting}
        </p>
      </Panel>
    );
  }

  return (
    <Panel className="mt-6 animate-fade-up text-start">
      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-mint">
        <span className="grid h-4 w-4 place-items-center rounded-full bg-mint text-navy">
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
        {t.sentToBrowser}
      </p>
      <div className="glass-soft mt-4 flex items-center gap-3 rounded-xl p-3">
        {item.thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element -- external CDN thumbnails, no optimizer
          <img
            src={item.thumbnail}
            alt=""
            referrerPolicy="no-referrer"
            className="h-12 w-20 shrink-0 rounded-lg border border-white/10 object-cover"
          />
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{item.title}</p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-white/50">
            {item.format} · {timeAgo(item.timestamp, lang)}
          </p>
        </div>
      </div>
      <p className="mt-3 font-mono text-[11px] leading-relaxed text-white/50">
        {t.nothingAppeared}
      </p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        {canRepick && (
          <button
            type="button"
            onClick={onRepick}
            className="rounded-full border border-white/15 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white/60 transition hover:border-white/40 hover:text-white"
          >
            {t.anotherQuality}
          </button>
        )}
        <button
          type="button"
          onClick={onReset}
          className="grad-primary flex-1 rounded-full py-3 text-sm font-bold tracking-wide text-[#fff] shadow-[0_8px_24px_rgba(79,140,255,0.35)] transition hover:brightness-110"
        >
          {t.grabAnother}
        </button>
      </div>
    </Panel>
  );
}
