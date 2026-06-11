export type Platform = "youtube" | "instagram" | "tiktok" | "twitter" | "facebook";

export interface PlatformMeta {
  name: string;
  color: string;
}

export const PLATFORMS: Record<Platform, PlatformMeta> = {
  youtube: { name: "YouTube", color: "#ff4242" },
  instagram: { name: "Instagram", color: "#f0589b" },
  tiktok: { name: "TikTok", color: "#3de8e2" },
  // X's brand color is theme-dependent (white on dark, navy on light).
  twitter: { name: "X", color: "var(--x-brand)" },
  facebook: { name: "Facebook", color: "#4d8df7" },
};

export function detectPlatform(url: string): Platform | null {
  if (/youtube\.com|youtu\.be/i.test(url)) return "youtube";
  if (/instagram\.com/i.test(url)) return "instagram";
  if (/tiktok\.com/i.test(url)) return "tiktok";
  if (/twitter\.com|x\.com/i.test(url)) return "twitter";
  if (/facebook\.com|fb\.watch/i.test(url)) return "facebook";
  return null;
}

export function isLikelyUrl(value: string): boolean {
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
