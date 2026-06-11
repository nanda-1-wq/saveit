import { PLATFORMS, type Platform } from "@/lib/platforms";

const ORDER: Platform[] = ["youtube", "instagram", "tiktok", "twitter", "facebook"];

// Official brand marks in real brand colors — decorative hero row only;
// functional UI elsewhere keeps the monochrome PlatformIcon set.
export default function BrandLogos() {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
      {ORDER.map((platform, index) => (
        <span
          key={platform}
          title={PLATFORMS[platform].name}
          style={{ animationDelay: `${index * 80}ms` }}
          className="animate-fade-up rounded-xl border border-white/15 bg-white/10 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-[10px] transition-all duration-200 ease-out hover:scale-[1.08] hover:border-white/30"
        >
          <BrandMark platform={platform} />
        </span>
      ))}
    </div>
  );
}

function BrandMark({ platform }: { platform: Platform }) {
  switch (platform) {
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" className="h-9 w-9" role="img" aria-label="YouTube">
          <path
            fill="#FF0000"
            d="M23.5 6.5a3 3 0 0 0-2.1-2.2C19.5 3.8 12 3.8 12 3.8s-7.5 0-9.4.5A3 3 0 0 0 .5 6.5 32 32 0 0 0 0 12a32 32 0 0 0 .5 5.5 3 3 0 0 0 2.1 2.2c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.2A32 32 0 0 0 24 12a32 32 0 0 0-.5-5.5Z"
          />
          <path fill="#fff" d="M9.6 15.6V8.4L15.8 12l-6.2 3.6Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" className="h-9 w-9" role="img" aria-label="Instagram">
          <defs>
            <radialGradient id="ig-gradient" cx="30%" cy="107%" r="150%">
              <stop offset="0%" stopColor="#fdf497" />
              <stop offset="5%" stopColor="#fdf497" />
              <stop offset="45%" stopColor="#fd5949" />
              <stop offset="60%" stopColor="#d6249f" />
              <stop offset="90%" stopColor="#285aeb" />
            </radialGradient>
          </defs>
          <g fill="none" stroke="url(#ig-gradient)" strokeWidth="2">
            <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
            <circle cx="12" cy="12" r="4.2" />
          </g>
          <circle cx="17.4" cy="6.6" r="1.4" fill="url(#ig-gradient)" />
        </svg>
      );
    case "tiktok":
      // currentColor: white in dark mode, navy in light mode (a literal white
      // mark would vanish on the light background).
      return (
        <svg viewBox="0 0 24 24" className="h-9 w-9 text-white" role="img" aria-label="TikTok">
          <path
            fill="currentColor"
            d="M16.7 5.6a4.8 4.8 0 0 1-1.2-2.9V2h-3.2v12.6a2.7 2.7 0 1 1-2.7-2.7c.3 0 .6 0 .8.1V8.7a6 6 0 0 0-.8-.1 5.9 5.9 0 1 0 5.9 6V9.5a8 8 0 0 0 4.6 1.4V7.7a4.8 4.8 0 0 1-3.4-2.1Z"
          />
        </svg>
      );
    case "twitter":
      return (
        <svg viewBox="0 0 24 24" className="h-9 w-9 text-white" role="img" aria-label="X">
          <path
            fill="currentColor"
            d="M18.2 2.5h3.3l-7.3 8.4 8.6 11.4h-6.7l-5.3-6.9-6 6.9H1.5l7.8-9L1 2.5h6.9l4.8 6.3 5.5-6.3Zm-1.2 17.8h1.9L6.9 4.4h-2l12.1 15.9Z"
          />
        </svg>
      );
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" className="h-9 w-9" role="img" aria-label="Facebook">
          <circle cx="12" cy="12" r="12" fill="#1877F2" />
          <path
            fill="#fff"
            d="M13.4 21.5v-7.6h2.6l.4-3h-3V9c0-.9.3-1.5 1.6-1.5h1.5V4.8a20 20 0 0 0-2.2-.1c-2.2 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5v7.6h2.9Z"
          />
        </svg>
      );
  }
}
