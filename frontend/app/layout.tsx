import type { Metadata } from "next";
import { Cairo, Geist, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
});

// Arabic is the default language, so Cairo ships with the page instead of
// being injected on demand.
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "SaveIt — Download Videos & Audio Instantly",
  description:
    "Paste a link from YouTube, Instagram, TikTok, X or Facebook and save it as MP4 or MP3.",
};

// Applies persisted theme/language before first paint to avoid a flash of the
// wrong mode. Arabic/RTL is the markup default; this switches to English only
// when the user previously chose it. React state syncs from the DOM after
// hydration.
const BOOT_SCRIPT = `try{if(localStorage.getItem("saveit:theme")==="light")document.documentElement.classList.add("light");if(localStorage.getItem("saveit:lang")==="en"){document.documentElement.lang="en";document.documentElement.dir="ltr";}}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${geist.variable} ${plexMono.variable} ${cairo.variable}`}
    >
      {/* suppressHydrationWarning: browser extensions (Grammarly, MetaMask,
          Bitwarden …) inject attributes into <body> before React hydrates,
          which React 19 reports as a hydration issue. Attribute-level only —
          content mismatches still surface. */}
      <body suppressHydrationWarning className="font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
