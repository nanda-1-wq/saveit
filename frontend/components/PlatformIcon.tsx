import type { Platform } from "@/lib/platforms";

interface Props {
  platform: Platform;
  className?: string;
}

export default function PlatformIcon({ platform, className }: Props) {
  switch (platform) {
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
          <path d="M23.5 6.5a3 3 0 0 0-2.1-2.2C19.5 3.8 12 3.8 12 3.8s-7.5 0-9.4.5A3 3 0 0 0 .5 6.5 32 32 0 0 0 0 12a32 32 0 0 0 .5 5.5 3 3 0 0 0 2.1 2.2c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.2A32 32 0 0 0 24 12a32 32 0 0 0-.5-5.5ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={className}
          aria-hidden
        >
          <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
          <circle cx="12" cy="12" r="4.2" />
          <circle cx="17.4" cy="6.6" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      );
    case "tiktok":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
          <path d="M16.7 5.6a4.8 4.8 0 0 1-1.2-2.9V2h-3.2v12.6a2.7 2.7 0 1 1-2.7-2.7c.3 0 .6 0 .8.1V8.7a6 6 0 0 0-.8-.1 5.9 5.9 0 1 0 5.9 6V9.5a8 8 0 0 0 4.6 1.4V7.7a4.8 4.8 0 0 1-3.4-2.1Z" />
        </svg>
      );
    case "twitter":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
          <path d="M18.2 2.5h3.3l-7.3 8.4 8.6 11.4h-6.7l-5.3-6.9-6 6.9H1.5l7.8-9L1 2.5h6.9l4.8 6.3 5.5-6.3Zm-1.2 17.8h1.9L6.9 4.4h-2l12.1 15.9Z" />
        </svg>
      );
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
          <path d="M13.4 21.5v-7.6h2.6l.4-3h-3V9c0-.9.3-1.5 1.6-1.5h1.5V4.8a20 20 0 0 0-2.2-.1c-2.2 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5v7.6h2.9Z" />
        </svg>
      );
    default:
      return null;
  }
}
