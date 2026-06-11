"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import BrandLogos from "@/components/BrandLogos";
import DownloadBar from "@/components/DownloadBar";
import DownloadProgress from "@/components/DownloadProgress";
import FormatPicker from "@/components/FormatPicker";
import HistoryList from "@/components/HistoryList";
import Panel from "@/components/Panel";
import Reveal from "@/components/Reveal";
import UrlInput from "@/components/UrlInput";
import { fetchVideoInfo, triggerDownload, type VideoFormat, type VideoInfo } from "@/lib/api";
import { clearHistory, loadHistory, pushHistory, type HistoryItem } from "@/lib/history";
import { LangProvider, localizeError, STRINGS, useT, type Lang } from "@/lib/i18n";
import { detectPlatform, isLikelyUrl, PLATFORMS, type Platform } from "@/lib/platforms";

type Stage = "idle" | "fetching" | "ready" | "sent";
type Theme = "dark" | "light";

export default function Home() {
  const [url, setUrl] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [selected, setSelected] = useState<VideoFormat | null>(null);
  const [lastSave, setLastSave] = useState<HistoryItem | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const requestSeq = useRef(0);

  const [theme, setTheme] = useState<Theme>("dark");
  const [lang, setLang] = useState<Lang>("en");
  const [visits, setVisits] = useState<number | null>(null);
  const [toast, setToast] = useState<{ id: number; filename: string } | null>(null);
  const toastSeq = useRef(0);
  const counted = useRef(false);
  const themeApplied = useRef(false);
  const langApplied = useRef(false);

  useEffect(() => {
    setHistory(loadHistory());
    // The layout boot script applied stored prefs pre-paint; the DOM is the
    // source of truth here, which avoids a hydration mismatch.
    setTheme(document.documentElement.classList.contains("light") ? "light" : "dark");
    setLang(document.documentElement.lang === "ar" ? "ar" : "en");
  }, []);

  useEffect(() => {
    if (!themeApplied.current) {
      themeApplied.current = true;
      return;
    }
    document.documentElement.classList.toggle("light", theme === "light");
    try {
      localStorage.setItem("saveit:theme", theme);
    } catch {
      // storage blocked — preference just won't persist
    }
  }, [theme]);

  useEffect(() => {
    if (!langApplied.current) {
      langApplied.current = true;
      return;
    }
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    try {
      localStorage.setItem("saveit:lang", lang);
    } catch {
      // storage blocked — preference just won't persist
    }
  }, [lang]);

  useEffect(() => {
    // Cairo is only fetched once Arabic is actually selected.
    if (lang !== "ar" || document.getElementById("cairo-font")) return;
    const link = document.createElement("link");
    link.id = "cairo-font";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap";
    document.head.appendChild(link);
  }, [lang]);

  useEffect(() => {
    if (counted.current) return;
    counted.current = true;
    fetch("https://api.counterapi.dev/v1/saveit-app/visits/up")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.count === "number") setVisits(data.count);
      })
      .catch(() => {
        // counter is decorative — fail silently
      });
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
    const filename = `${info.title}.${selected.ext}`;
    triggerDownload(url, selected.format_id, selected.ext, filename);
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
    setToast({ id: ++toastSeq.current, filename });
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

  const dismissToast = useCallback(() => setToast(null), []);
  // Home itself sits outside LangProvider, so it reads the dictionary directly.
  const t = STRINGS[lang];

  return (
    <LangProvider lang={lang}>
      <div className="relative min-h-screen overflow-x-hidden">
        <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="orb orb-a" />
          <div className="orb orb-b" />
          <div className="orb orb-c" />
        </div>

        <Navbar
          busy={stage === "fetching"}
          theme={theme}
          lang={lang}
          onToggleTheme={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}
          onToggleLang={() => setLang((value) => (value === "en" ? "ar" : "en"))}
        />

        <main className="relative z-10 mx-auto w-full max-w-6xl px-5">
          {/* HERO + working app flow */}
          <section
            id="grab"
            className="flex min-h-[calc(100vh-4rem)] scroll-mt-24 flex-col items-center justify-center pb-20 pt-16 text-center"
          >
            <BrandLogos />

            <h1 className="max-w-4xl animate-fade-up text-[clamp(48px,7vw,80px)] font-extrabold leading-[1.02] tracking-[-2px]">
              {t.headline} <span className="grad-text">{t.headlineAccent}</span>
            </h1>
            <p className="mt-4 max-w-[560px] animate-fade-up text-lg leading-[1.7] text-white/65 [animation-delay:80ms] sm:text-xl">
              {t.sub}
            </p>

            <div className="mt-8 w-full max-w-2xl animate-fade-up [animation-delay:160ms]">
              <UrlInput
                value={url}
                platform={platform}
                busy={stage === "fetching"}
                onChange={setUrl}
                onSubmit={submit}
              />

              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {(Object.keys(PLATFORMS) as Platform[]).map((key) => (
                  <span
                    key={key}
                    className={`text-xs font-medium transition-colors duration-300 ${
                      platform === key ? "" : "text-white/45"
                    }`}
                    style={platform === key ? { color: PLATFORMS[key].color } : undefined}
                  >
                    {PLATFORMS[key].name}
                  </span>
                ))}
              </div>

              {visits !== null && (
                <p className="mt-4 text-xs text-white/45">
                  {t.videosSaved(visits.toLocaleString("en-US"))}
                </p>
              )}

              {error && (
                <div
                  role="alert"
                  className="glass mt-6 animate-fade-up rounded-2xl border-alarm/40 px-4 py-3 text-start"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-alarm">
                    {t.errorLabel}
                  </p>
                  <p className="mt-1 text-sm">{localizeError(error, lang)}</p>
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
            </div>
          </section>

          <HowItWorks />
          <FeaturesGrid />
          <FormatShowcase />
        </main>

        <Footer />

        {toast && (
          <DownloadBar key={toast.id} filename={toast.filename} onDismiss={dismissToast} />
        )}
      </div>
    </LangProvider>
  );
}

function Navbar({
  busy,
  theme,
  lang,
  onToggleTheme,
  onToggleLang,
}: {
  busy: boolean;
  theme: Theme;
  lang: Lang;
  onToggleTheme: () => void;
  onToggleLang: () => void;
}) {
  const t = useT();
  const togglePill =
    "grid h-7 place-items-center rounded-full border border-white/15 bg-white/10 backdrop-blur-[10px] transition hover:border-white/30";
  return (
    <header className="glass-bar sticky top-0 z-50 border-b border-white/10">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <a href="#grab" className="flex items-center gap-2.5">
          <span className="grad-primary grid h-9 w-9 place-items-center rounded-xl shadow-[0_4px_16px_rgba(79,140,255,0.4)]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-[#fff]"
              aria-hidden
            >
              <path d="M12 3v11m0 0 4.5-4.5M12 14 7.5 9.5M4 17v3h16v-3" />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight">SaveIt</span>
          {busy && <span className="ms-1 h-1.5 w-1.5 rounded-full bg-electric animate-blink" />}
        </a>
        <nav className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? t.switchToLight : t.switchToDark}
            className={`${togglePill} w-10`}
          >
            {theme === "dark" ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="h-4 w-4"
                aria-hidden
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={onToggleLang}
            aria-label={t.switchLang}
            className={`${togglePill} px-2.5 font-mono text-[11px] font-semibold`}
          >
            {lang === "en" ? "AR" : "EN"}
          </button>
          <a
            href="#grab"
            className="grad-primary rounded-full px-4 py-2 text-sm font-semibold text-[#fff] shadow-[0_4px_16px_rgba(79,140,255,0.4)] transition hover:brightness-110"
          >
            {t.tryFree}
          </a>
        </nav>
      </div>
    </header>
  );
}

function FetchingPanel({ platform }: { platform: Platform | null }) {
  const t = useT();
  const name = platform ? PLATFORMS[platform].name : t.genericSource;
  return (
    <Panel className="mt-6 animate-fade-up text-start">
      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-electric">
        <span className="h-2 w-2 rounded-full bg-electric animate-blink" />
        {t.contacting(name)}
      </p>
      <div className="scan-track mt-4 h-1.5 w-full rounded-full bg-white/10">
        <div className="scan-bar grad-primary h-full w-1/3 rounded-full" />
      </div>
      <div className="mt-5 space-y-2">
        <div className="glass-soft h-16 animate-pulse rounded-xl" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="glass-soft h-14 animate-pulse rounded-xl" />
          <div className="glass-soft h-14 animate-pulse rounded-xl [animation-delay:150ms]" />
          <div className="glass-soft hidden h-14 animate-pulse rounded-xl sm:block [animation-delay:300ms]" />
        </div>
      </div>
      <p className="mt-4 font-mono text-[11px] text-white/50">{t.readingFormats}</p>
    </Panel>
  );
}

function HowItWorks() {
  const t = useT();
  return (
    <section className="py-24">
      <Reveal>
        <h2 className="text-center text-3xl font-extrabold tracking-[-1px] sm:text-4xl">
          {t.howTitle}
        </h2>
      </Reveal>
      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {t.steps.map((step, index) => (
          <Reveal key={step.title} delay={index * 100}>
            <div className="glass h-full rounded-[20px] p-6">
              <span className="grad-primary grid h-12 w-12 place-items-center rounded-full text-lg font-extrabold text-[#fff] shadow-[0_4px_16px_rgba(79,140,255,0.4)]">
                {index + 1}
              </span>
              <h3 className="mt-5 text-lg font-bold tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-[1.7] text-white/65">{step.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const FEATURE_ICONS: ReactNode[] = [
  <svg
    key="globe"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    className="h-7 w-7"
    aria-hidden
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M3.6 9h16.8M3.6 15h16.8M12 3a14.5 14.5 0 0 1 0 18M12 3a14.5 14.5 0 0 0 0 18" />
  </svg>,
  <svg
    key="media"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-7 w-7"
    aria-hidden
  >
    <rect x="3" y="5" width="13" height="13" rx="2.5" />
    <path d="m8.5 9.5 4 2.5-4 2.5v-5Z" />
    <path d="M21 7v7.5a2 2 0 1 1-1.5-1.94V8.5" />
  </svg>,
  <svg
    key="bars"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    className="h-7 w-7"
    aria-hidden
  >
    <path d="M4 17V9m5 8V5m5 12v-6m5 6V7" />
  </svg>,
  <svg
    key="shield"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-7 w-7"
    aria-hidden
  >
    <path d="M12 3 5 6v5c0 4.5 3 8.2 7 10 4-1.8 7-5.5 7-10V6l-7-3Z" />
    <path d="m9 11.8 2.2 2.2L15.4 9.8" />
  </svg>,
];

function FeaturesGrid() {
  const t = useT();
  return (
    <section className="py-12">
      <div className="grid gap-5 sm:grid-cols-2">
        {t.features.map((feature, index) => (
          <Reveal key={feature.title} delay={(index % 2) * 100}>
            <div className="glass h-full rounded-[20px] p-6">
              <span className="text-white">{FEATURE_ICONS[index]}</span>
              <h3 className="mt-4 text-lg font-bold tracking-tight">{feature.title}</h3>
              <p className="mt-2 text-sm leading-[1.7] text-white/65">{feature.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const SHOWCASE_MP4 = [
  { label: "2160p60", size: "3.8 GB" },
  { label: "1440p60", size: "2.1 GB" },
  { label: "1080p60", size: "1.2 GB", selected: true },
  { label: "720p", size: "640 MB" },
  { label: "480p", size: "320 MB" },
  { label: "360p", size: "180 MB" },
];

const SHOWCASE_MP3 = ["320 kbps", "192 kbps", "128 kbps"];

// Pure visual demo of the picker — intentionally non-interactive.
function FormatShowcase() {
  const t = useT();
  return (
    <section className="py-24">
      <Reveal>
        <h2 className="text-center text-3xl font-extrabold tracking-[-1px] sm:text-4xl">
          {t.showcaseTitle}
        </h2>
        <p className="mx-auto mt-4 max-w-[560px] text-center text-base leading-[1.7] text-white/65">
          {t.showcaseSub}
        </p>
      </Reveal>
      <Reveal delay={120}>
        <div aria-hidden className="glass mx-auto mt-12 max-w-3xl rounded-3xl p-6 text-start sm:p-8">
          <div className="flex gap-4">
            <div className="grad-primary h-20 w-32 shrink-0 rounded-xl opacity-60" />
            <div className="min-w-0">
              <p className="text-lg font-bold tracking-tight">
                Northern lights over Lofoten — 4K
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
                youtube · 12:48 · <span className="text-mint">{t.sourceLocked}</span>
              </p>
            </div>
          </div>

          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
            {t.videoMp4}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SHOWCASE_MP4.map((format) => (
              <div
                key={format.label}
                className={`rounded-xl border px-3 py-2.5 ${
                  format.selected
                    ? "border-electric bg-electric/15 shadow-[0_0_24px_rgba(79,140,255,0.25)]"
                    : "glass-soft"
                }`}
              >
                <span className="block text-base font-bold leading-none tracking-tight">
                  {format.label}
                </span>
                <span className="mt-1.5 block font-mono text-[10px] uppercase tracking-wider text-white/50">
                  {format.size}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
            {t.audioMp3}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {SHOWCASE_MP3.map((label) => (
              <div key={label} className="glass-soft rounded-xl border px-3 py-2.5">
                <span className="block text-base font-bold leading-none tracking-tight">
                  {label}
                </span>
                <span className="mt-1.5 block font-mono text-[10px] uppercase tracking-wider text-white/50">
                  {t.audioChip}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  const t = useT();
  return (
    <footer className="relative z-10 border-t border-white/10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-5 py-8 text-sm text-white/45 sm:flex-row">
        <span>
          {t.builtPrefix}
          <a
            href="https://x.com/3Desso"
            target="_blank"
            rel="noopener noreferrer"
            className="text-electric hover:underline"
          >
            @3Desso
          </a>
          {t.builtSuffix}
        </span>
        <span>{t.footerRight}</span>
      </div>
    </footer>
  );
}
