"use client";

import { useState, type ReactNode } from "react";
import Panel from "@/components/Panel";
import PlatformIcon from "@/components/PlatformIcon";
import type { VideoFormat, VideoInfo } from "@/lib/api";
import { estimateMp3Mb, formatDuration, formatSize } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { PLATFORMS } from "@/lib/platforms";

interface Props {
  info: VideoInfo;
  selected: VideoFormat | null;
  onSelect: (format: VideoFormat) => void;
  onDownload: () => void;
  onCancel: () => void;
  downloading: boolean;
  downloadPercent: number | null;
}

function sizeLabel(format: VideoFormat, duration: number | null): string | null {
  if (format.ext === "mp3") {
    const estimate = estimateMp3Mb(duration, format.abr);
    return estimate ? `~${estimate} MB` : null;
  }
  return formatSize(format.filesize_approx);
}

export default function FormatPicker({
  info,
  selected,
  onSelect,
  onDownload,
  onCancel,
  downloading,
  downloadPercent,
}: Props) {
  const t = useT();
  const [thumbBroken, setThumbBroken] = useState(false);
  const video = info.formats.filter((format) => format.ext === "mp4");
  const audio = info.formats.filter((format) => format.ext === "mp3");
  const meta = PLATFORMS[info.platform];
  const duration = formatDuration(info.duration);
  const selectedSize = selected ? sizeLabel(selected, info.duration) : null;

  return (
    <Panel className="mt-6 animate-fade-up text-start">
      <div className="flex gap-4">
        {info.thumbnail && !thumbBroken ? (
          // eslint-disable-next-line @next/next/no-img-element -- external CDN thumbnails, no optimizer
          <img
            src={info.thumbnail}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setThumbBroken(true)}
            className="h-20 w-32 shrink-0 rounded-xl border border-white/10 object-cover"
          />
        ) : (
          <span className="grad-primary grid h-20 w-32 shrink-0 place-items-center rounded-xl opacity-80">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="#fff" aria-hidden>
              <path d="M8.5 5.5v13l10-6.5-10-6.5Z" />
            </svg>
          </span>
        )}
        <div className="min-w-0">
          <h2 className="line-clamp-2 text-lg font-bold leading-snug tracking-tight">
            {info.title}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
            <span className="flex items-center gap-1.5" style={{ color: meta.color }}>
              <PlatformIcon platform={info.platform} className="h-3 w-3" />
              {meta.name}
            </span>
            {duration && <span>{duration}</span>}
            <span className="text-mint">{t.sourceLocked}</span>
          </div>
        </div>
      </div>

      {video.length > 0 && (
        <FormatGroup label={t.videoMp4}>
          {video.map((format) => (
            <FormatCard
              key={`${format.format_id}-${format.label}`}
              format={format}
              duration={info.duration}
              active={selected === format}
              onSelect={() => onSelect(format)}
            />
          ))}
        </FormatGroup>
      )}

      {audio.length > 0 && (
        <FormatGroup label={t.audioMp3}>
          {audio.map((format) => (
            <FormatCard
              key={`${format.format_id}-${format.label}`}
              format={format}
              duration={info.duration}
              active={selected === format}
              onSelect={() => onSelect(format)}
            />
          ))}
        </FormatGroup>
      )}

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-white/15 px-5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/60 transition hover:border-white/40 hover:text-white"
        >
          {t.cancel}
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={!selected || downloading}
          className="grad-primary flex-1 rounded-full py-3.5 text-sm font-bold tracking-wide text-[#fff] shadow-[0_8px_24px_rgba(79,140,255,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {downloading ? (
            <>
              {t.downloading}
              {downloadPercent !== null && (
                <span dir="ltr" className="ms-1.5">
                  {downloadPercent}%
                </span>
              )}
            </>
          ) : selected ? (
            <>
              {t.grab}{" "}
              <span dir="ltr">
                {selected.label}
                {selectedSize ? ` · ${selectedSize}` : ""}
              </span>
            </>
          ) : (
            t.pickFormat
          )}
        </button>
      </div>
    </Panel>
  );
}

function FormatGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">{label}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{children}</div>
    </div>
  );
}

function FormatCard({
  format,
  duration,
  active,
  onSelect,
}: {
  format: VideoFormat;
  duration: number | null;
  active: boolean;
  onSelect: () => void;
}) {
  const t = useT();
  const isAudio = format.ext === "mp3";
  const size = sizeLabel(format, duration);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`relative rounded-xl border px-3 py-2.5 text-start transition-all ${
        active
          ? "border-electric bg-electric/15 shadow-[0_0_24px_rgba(79,140,255,0.25)]"
          : "glass-soft hover:border-white/25"
      }`}
    >
      <span className="block text-base font-bold leading-none tracking-tight">
        {isAudio && format.abr ? (
          <>
            {format.abr}
            <span className="ms-1 text-[10px] font-semibold text-white/50">KBPS</span>
          </>
        ) : (
          format.label
        )}
      </span>
      <span className="mt-1.5 block font-mono text-[10px] uppercase tracking-wider text-white/50">
        {size ? (
          <>
            <span dir="ltr">{size}</span>
            {isAudio && <span className="ms-1">{t.estMark}</span>}
          </>
        ) : (
          t.sizeUnknown
        )}
      </span>
      {active && <span className="absolute end-2 top-2 h-1.5 w-1.5 rounded-full bg-electric" />}
    </button>
  );
}
