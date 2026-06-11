"use client";

import PlatformIcon from "@/components/PlatformIcon";
import { PLATFORMS, type Platform } from "@/lib/platforms";

interface Props {
  value: string;
  platform: Platform | null;
  busy: boolean;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}

export default function UrlInput({ value, platform, busy, onChange, onSubmit }: Props) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(value);
      }}
      className="relative flex items-stretch border border-line bg-char transition-colors focus-within:border-signal/70"
    >
      <span aria-hidden className="grid w-11 shrink-0 place-items-center text-ash">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
          className="h-4 w-4"
        >
          <path d="M9.5 14.5 14.5 9.5M8 11l-2.4 2.4a3.5 3.5 0 0 0 5 5L13 16M11 8l2.4-2.4a3.5 3.5 0 0 1 5 5L16 13" />
        </svg>
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onPaste={(event) => {
          const text = event.clipboardData.getData("text").trim();
          if (!text) return;
          event.preventDefault();
          onChange(text);
          onSubmit(text);
        }}
        placeholder="Paste a video link…"
        spellCheck={false}
        autoFocus
        inputMode="url"
        enterKeyHint="go"
        aria-label="Video URL"
        disabled={busy}
        className="min-w-0 flex-1 bg-transparent py-4 font-mono text-sm text-bone placeholder:text-ash/50 focus:outline-none disabled:opacity-60"
      />
      {platform && (
        <span
          className="mr-2 hidden items-center gap-1.5 self-center border border-line bg-tar px-2 py-1 font-mono text-[10px] uppercase tracking-widest sm:flex"
          style={{ color: PLATFORMS[platform].color }}
        >
          <PlatformIcon platform={platform} className="h-3 w-3" />
          {PLATFORMS[platform].name}
        </span>
      )}
      <button
        type="submit"
        disabled={busy || !value.trim()}
        className="m-1.5 flex w-24 shrink-0 items-center justify-center gap-2 bg-signal font-display text-sm font-bold tracking-wide text-tar transition hover:bg-ember disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? (
          <span
            aria-label="Fetching"
            className="h-4 w-4 animate-spin rounded-full border-2 border-tar/30 border-t-tar"
          />
        ) : (
          "GRAB"
        )}
      </button>
    </form>
  );
}
