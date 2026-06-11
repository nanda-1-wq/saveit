"use client";

import type { ReactNode } from "react";
import Panel from "@/components/Panel";
import PlatformIcon from "@/components/PlatformIcon";
import type { VideoFormat, VideoInfo } from "@/lib/api";
import { formatBytes, formatDuration } from "@/lib/format";
import { PLATFORMS } from "@/lib/platforms";

interface Props {
  info: VideoInfo;
  selected: VideoFormat | null;
  onSelect: (format: VideoFormat) => void;
  onDownload: () => void;
  onCancel: () => void;
}

export default function FormatPicker({ info, selected, onSelect, onDownload, onCancel }: Props) {
  const video = info.formats.filter((format) => format.ext === "mp4");
  const audio = info.formats.filter((format) => format.ext === "mp3");
  const meta = PLATFORMS[info.platform];
  const duration = formatDuration(info.duration);

  return (
    <Panel className="mt-6 animate-fade-up">
      <div className="flex gap-4">
        {info.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element -- external CDN thumbnails, no optimizer
          <img
            src={info.thumbnail}
            alt=""
            referrerPolicy="no-referrer"
            className="h-20 w-32 shrink-0 border border-line object-cover"
          />
        ) : (
          <span className="grid h-20 w-32 shrink-0 place-items-center border border-line bg-tar text-ash">
            <PlatformIcon platform={info.platform} className="h-6 w-6" />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="line-clamp-2 font-display text-lg font-bold leading-snug">{info.title}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ash">
            <span className="flex items-center gap-1.5" style={{ color: meta.color }}>
              <PlatformIcon platform={info.platform} className="h-3 w-3" />
              {meta.name}
            </span>
            {duration && <span>{duration}</span>}
            <span className="text-mint">source locked</span>
          </div>
        </div>
      </div>

      {video.length > 0 && (
        <FormatGroup label="video — mp4">
          {video.map((format) => (
            <FormatCard
              key={`${format.format_id}-${format.label}`}
              format={format}
              active={selected === format}
              onSelect={() => onSelect(format)}
            />
          ))}
        </FormatGroup>
      )}

      {audio.length > 0 && (
        <FormatGroup label="audio — mp3">
          {audio.map((format) => (
            <FormatCard
              key={`${format.format_id}-${format.label}`}
              format={format}
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
          className="border border-line px-4 font-mono text-[11px] uppercase tracking-[0.18em] text-ash transition hover:border-ash hover:text-bone"
        >
          cancel
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={!selected}
          className="flex-1 bg-signal py-3.5 font-display text-sm font-bold tracking-wide text-tar transition hover:bg-ember disabled:cursor-not-allowed disabled:opacity-40"
        >
          {selected ? `DOWNLOAD ${selected.label.toUpperCase()}` : "PICK A FORMAT"}
        </button>
      </div>
    </Panel>
  );
}

function FormatGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ash">{label}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{children}</div>
    </div>
  );
}

function FormatCard({
  format,
  active,
  onSelect,
}: {
  format: VideoFormat;
  active: boolean;
  onSelect: () => void;
}) {
  const isAudio = format.ext === "mp3";
  const size = formatBytes(format.filesize_approx);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`relative border px-3 py-2.5 text-left transition-all ${
        active ? "border-signal bg-signal/10" : "border-line bg-tar hover:border-ash/60"
      }`}
    >
      <span className="block font-display text-base font-bold leading-none">
        {isAudio && format.abr ? (
          <>
            {format.abr}
            <span className="ml-1 text-[10px] font-semibold text-ash">KBPS</span>
          </>
        ) : (
          format.label
        )}
      </span>
      <span className="mt-1.5 block font-mono text-[10px] uppercase tracking-wider text-ash">
        {isAudio ? "mp3 · audio" : (size ?? "mp4")}
      </span>
      {active && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-signal" />}
    </button>
  );
}
