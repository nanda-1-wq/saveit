"use client";

import PlatformIcon from "@/components/PlatformIcon";
import { timeAgo } from "@/lib/format";
import type { HistoryItem } from "@/lib/history";
import { useLang, useT } from "@/lib/i18n";
import { PLATFORMS, type Platform } from "@/lib/platforms";

interface Props {
  items: HistoryItem[];
  onClear: () => void;
}

export default function HistoryList({ items, onClear }: Props) {
  const t = useT();
  const lang = useLang();
  return (
    <section className="glass mt-14 animate-fade-up rounded-3xl p-5 text-start sm:p-6">
      <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
          {t.archive(items.length)}
        </h2>
        <button
          type="button"
          onClick={onClear}
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 transition hover:text-alarm"
        >
          {t.clear}
        </button>
      </div>
      <ol>
        {items.map((item, index) => {
          const platform = item.platform as Platform;
          const known = platform in PLATFORMS;
          return (
            <li
              key={`${item.timestamp}-${index}`}
              className="flex items-center gap-3 border-b border-white/5 py-2.5 last:border-b-0 last:pb-0"
            >
              <span className="w-6 shrink-0 font-mono text-[10px] text-white/30">
                {String(index + 1).padStart(2, "0")}
              </span>
              {item.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element -- external CDN thumbnails, no optimizer
                <img
                  src={item.thumbnail}
                  alt=""
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="h-9 w-14 shrink-0 rounded-lg border border-white/10 object-cover"
                />
              ) : (
                <span className="glass-soft grid h-9 w-14 shrink-0 place-items-center rounded-lg text-white/50">
                  {known && <PlatformIcon platform={platform} className="h-3.5 w-3.5" />}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{item.title}</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-white/50">
                  {known ? `${PLATFORMS[platform].name} · ` : ""}
                  {item.format} · {timeAgo(item.timestamp, lang)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
