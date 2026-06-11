"use client";

import PlatformIcon from "@/components/PlatformIcon";
import { timeAgo } from "@/lib/format";
import type { HistoryItem } from "@/lib/history";
import { PLATFORMS, type Platform } from "@/lib/platforms";

interface Props {
  items: HistoryItem[];
  onClear: () => void;
}

export default function HistoryList({ items, onClear }: Props) {
  return (
    <section className="mt-14 animate-fade-up">
      <div className="flex items-baseline justify-between border-b border-line pb-2">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
          archive — last {items.length} {items.length === 1 ? "save" : "saves"}
        </h2>
        <button
          type="button"
          onClick={onClear}
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-ash/70 transition hover:text-alarm"
        >
          clear
        </button>
      </div>
      <ol>
        {items.map((item, index) => {
          const platform = item.platform as Platform;
          const known = platform in PLATFORMS;
          return (
            <li
              key={`${item.timestamp}-${index}`}
              className="flex items-center gap-3 border-b border-line/60 py-2.5"
            >
              <span className="w-6 shrink-0 font-mono text-[10px] text-ash/60">
                {String(index + 1).padStart(2, "0")}
              </span>
              {item.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element -- external CDN thumbnails, no optimizer
                <img
                  src={item.thumbnail}
                  alt=""
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="h-9 w-14 shrink-0 border border-line object-cover"
                />
              ) : (
                <span className="grid h-9 w-14 shrink-0 place-items-center border border-line bg-char text-ash">
                  {known && <PlatformIcon platform={platform} className="h-3.5 w-3.5" />}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{item.title}</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-ash">
                  {known ? `${PLATFORMS[platform].name} · ` : ""}
                  {item.format} · {timeAgo(item.timestamp)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
