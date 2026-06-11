export interface HistoryItem {
  title: string;
  platform: string;
  format: string;
  timestamp: number;
  thumbnail: string | null;
}

const KEY = "saveit:history";
const MAX_ITEMS = 10;

export function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is HistoryItem =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as HistoryItem).title === "string" &&
          typeof (item as HistoryItem).timestamp === "number",
      )
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

export function pushHistory(item: HistoryItem): HistoryItem[] {
  const next = [item, ...loadHistory()].slice(0, MAX_ITEMS);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked — history is best-effort.
  }
  return next;
}

export function clearHistory(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
