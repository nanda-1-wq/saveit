"use client";

import { useEffect, useRef, useState } from "react";
import DownloadProgress from "@/components/DownloadProgress";
import FormatPicker from "@/components/FormatPicker";
import HistoryList from "@/components/HistoryList";
import Panel from "@/components/Panel";
import PlatformIcon from "@/components/PlatformIcon";
import UrlInput from "@/components/UrlInput";
import { fetchVideoInfo, triggerDownload, type VideoFormat, type VideoInfo } from "@/lib/api";
import { clearHistory, loadHistory, pushHistory, type HistoryItem } from "@/lib/history";
import { detectPlatform, isLikelyUrl, PLATFORMS, type Platform } from "@/lib/platforms";

type Stage = "idle" | "fetching" | "ready" | "sent";

export default function Home() {
  const [url, setUrl] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [selected, setSelected] = useState<VideoFormat | null>(null);
  const [lastSave, setLastSave] = useState<HistoryItem | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const requestSeq = useRef(0);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const platform = detectPlatform(url);

  async function submit(raw: string) {
    const value = raw.trim();
    if (!value) return;
    setUrl(value);
    setError(null);
    setInfo(null);
    setSelected(null);
    setLastSave(null);

    if (!isLikelyUrl(value)) {
      setStage("idle");
      setError("That doesn't look like a valid video link.");
      return;
    }
    if (!detectPlatform(value)) {
      setStage("idle");
      setError("This platform isn't supported yet.");
      return;
    }

    const seq = ++requestSeq.current;
    setStage("fetching");
    try {
      const result = await fetchVideoInfo(value);
      if (seq !== requestSeq.current) return;
      setInfo(result);
      setSelected(result.formats[0] ?? null);
      setStage("ready");
    } catch (err) {
      if (seq !== requestSeq.current) return;
      setStage("idle");
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Try again or paste a different link.",
      );
    }
  }

  function startDownload() {
    if (!info || !selected) return;
    triggerDownload(url, selected.format_id, selected.ext, `${info.title}.${selected.ext}`);
    const item: HistoryItem = {
      title: info.title,
      platform: info.platform,
      format: selected.label,
      timestamp: Date.now(),
      thumbnail: info.thumbnail,
    };
    setHistory(pushHistory(item));
    setLastSave(item);
    setStage("sent");
  }

  function reset() {
    requestSeq.current++;
    setUrl("");
    setStage("idle");
    setError(null);
    setInfo(null);
    setSelected(null);
    setLastSave(null);
  }

  const showHero = stage === "idle" || stage === "fetching";

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-44 left-1/2 h-120 w-184 -translate-x-1/2 rounded-full bg-signal/[0.07] blur-3xl" />
        <div className="bg-scanlines absolute inset-0 opacity-[0.035]" />
      </div>

      <main className="relative mx-auto flex w-full max-w-2xl flex-col px-5 pb-20 pt-10 sm:pt-14">
        <header className="flex items-center justify-between animate-fade-up">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center bg-signal text-tar">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="square"
                className="h-5 w-5"
                aria-hidden
              >
                <path d="M12 3v11m0 0 4.5-4.5M12 14 7.5 9.5M4 17v3h16v-3" />
              </svg>
            </span>
            <div className="leading-none">
              <p className="font-display text-lg font-extrabold tracking-tight">SaveIt</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
                personal media archive
              </p>
            </div>
          </div>
          <span className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ash sm:flex">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                stage === "fetching" ? "bg-signal animate-blink" : "bg-mint"
              }`}
            />
            {stage === "fetching" ? "working" : "ready"}
          </span>
        </header>

        {showHero && (
          <section className="mt-12 animate-fade-up [animation-delay:60ms] sm:mt-16">
            <h1 className="font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">
              Save any
              <br />
              video<span className="text-signal">.</span>
            </h1>
            <p className="mt-5 max-w-md font-mono text-xs leading-relaxed text-ash sm:text-sm">
              Paste a link from YouTube, Instagram, TikTok, X or Facebook. Pick a quality.
              It lands in your downloads — MP4 or MP3.
            </p>
          </section>
        )}

        <div className={`${showHero ? "mt-8" : "mt-10"} animate-fade-up [animation-delay:120ms]`}>
          <UrlInput
            value={url}
            platform={platform}
            busy={stage === "fetching"}
            onChange={setUrl}
            onSubmit={submit}
          />
          <div className="mt-4 flex items-center gap-4">
            {(Object.keys(PLATFORMS) as Platform[]).map((key) => (
              <span
                key={key}
                title={PLATFORMS[key].name}
                className={`transition-all duration-300 ${
                  platform === key ? "scale-110 opacity-100" : "opacity-30"
                }`}
                style={platform === key ? { color: PLATFORMS[key].color } : undefined}
              >
                <PlatformIcon platform={key} className="h-4 w-4" />
              </span>
            ))}
            <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
              {platform ? `${PLATFORMS[platform].name} detected` : "auto-detect"}
            </span>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 border border-alarm/40 bg-alarm/6 px-4 py-3 animate-fade-up"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-alarm">error</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        {stage === "fetching" && <FetchingPanel platform={platform} />}

        {stage === "ready" && info && (
          <FormatPicker
            info={info}
            selected={selected}
            onSelect={setSelected}
            onDownload={startDownload}
            onCancel={reset}
          />
        )}

        {stage === "sent" && lastSave && (
          <DownloadProgress
            item={lastSave}
            canRepick={Boolean(info)}
            onRepick={() => setStage("ready")}
            onReset={reset}
          />
        )}

        {history.length > 0 && (
          <HistoryList
            items={history}
            onClear={() => {
              clearHistory();
              setHistory([]);
            }}
          />
        )}

        <footer className="mt-16 flex items-center justify-between border-t border-line pt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-ash/70">
          <span>for personal use</span>
          <span>respect creators</span>
        </footer>
      </main>
    </div>
  );
}

function FetchingPanel({ platform }: { platform: Platform | null }) {
  const name = platform ? PLATFORMS[platform].name : "source";
  return (
    <Panel className="mt-6 animate-fade-up">
      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-signal">
        <span className="h-2 w-2 rounded-full bg-signal animate-blink" />
        contacting {name}
      </p>
      <div className="scan-track mt-4 h-1 w-full bg-line">
        <div className="scan-bar h-full w-1/3 bg-signal" />
      </div>
      <div className="mt-5 space-y-2">
        <div className="h-16 animate-pulse border border-line bg-tar" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="h-14 animate-pulse border border-line bg-tar" />
          <div className="h-14 animate-pulse border border-line bg-tar [animation-delay:150ms]" />
          <div className="hidden h-14 animate-pulse border border-line bg-tar sm:block [animation-delay:300ms]" />
        </div>
      </div>
      <p className="mt-4 font-mono text-[11px] text-ash">
        Reading available formats — slow sources can take ~10 seconds.
      </p>
    </Panel>
  );
}
