"use client";

import PlatformIcon from "@/components/PlatformIcon";
import { useT } from "@/lib/i18n";
import { PLATFORMS, type Platform } from "@/lib/platforms";

interface Props {
  value: string;
  platform: Platform | null;
  busy: boolean;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onClear: () => void;
}

export default function UrlInput({ value, platform, busy, onChange, onSubmit, onClear }: Props) {
  const t = useT();
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(value);
      }}
      className="flex h-16 w-full items-stretch rounded-[32px] border border-white/25 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-[20px] transition-all duration-300 focus-within:border-electric/60 focus-within:shadow-[0_0_0_3px_rgba(79,140,255,0.25),0_8px_32px_rgba(0,0,0,0.3)]"
    >
      <span aria-hidden className="grid w-12 shrink-0 place-items-center text-white/40">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
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
        placeholder={t.placeholder}
        spellCheck={false}
        autoFocus
        inputMode="url"
        enterKeyHint="go"
        dir="auto"
        aria-label={t.urlAria}
        disabled={busy}
        className="min-w-0 flex-1 bg-transparent pe-3 font-mono text-base text-white placeholder:text-white/40 focus:outline-none disabled:opacity-60"
      />
      {platform && (
        <span
          className="me-1 hidden items-center gap-1.5 self-center rounded-full border border-white/10 bg-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest sm:flex"
          style={{ color: PLATFORMS[platform].color }}
        >
          <PlatformIcon platform={platform} className="h-3 w-3" />
          {PLATFORMS[platform].name}
        </span>
      )}
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label={t.clearUrl}
          className="grid w-9 shrink-0 place-items-center self-stretch text-white/50 transition-colors hover:text-white/90"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="h-4 w-4"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
      <button
        type="submit"
        disabled={busy || !value.trim()}
        className="grad-primary m-2 flex min-w-28 shrink-0 items-center justify-center gap-2 rounded-full px-5 text-base font-bold tracking-wide text-[#fff] shadow-[0_4px_16px_rgba(79,140,255,0.4)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? (
          <span
            aria-hidden
            className="h-4 w-4 animate-spin rounded-full border-2 border-[#ffffff4d] border-t-[#fff]"
          />
        ) : (
          t.grab
        )}
      </button>
    </form>
  );
}
