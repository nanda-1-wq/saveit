import type { Metadata } from "next";
import { Geist, IBM_Plex_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "SaveIt — Download Videos & Audio Instantly",
  description:
    "Paste a link from YouTube, Instagram, TikTok, X or Facebook and save it as MP4 or MP3.",
};

// Applies persisted theme/language before first paint to avoid a flash of the
// wrong mode; React state syncs from the DOM after hydration.
const BOOT_SCRIPT = `try{if(localStorage.getItem("saveit:theme")==="light")document.documentElement.classList.add("light");if(localStorage.getItem("saveit:lang")==="ar"){document.documentElement.lang="ar";document.documentElement.dir="rtl";}}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${plexMono.variable}`}>
      <body className="font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
