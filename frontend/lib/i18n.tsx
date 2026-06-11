"use client";

import { createContext, useContext, type ReactNode } from "react";

export type Lang = "en" | "ar";

const en = {
  // navbar
  tryFree: "Try it free",
  switchToLight: "Switch to light mode",
  switchToDark: "Switch to dark mode",
  switchLang: "التبديل إلى العربية",
  // hero
  headline: "Download Videos & Audio",
  headlineAccent: "Instantly",
  sub: "Paste a YouTube, Instagram, TikTok, X, or Facebook link. Choose quality. Download in seconds.",
  placeholder: "Paste a video link…",
  grab: "GRAB",
  urlAria: "Video URL",
  videosSaved: (count: string) => `${count} videos saved`,
  // fetching / errors
  contacting: (name: string) => `contacting ${name}`,
  genericSource: "source",
  readingFormats: "Reading available formats — slow sources can take ~10 seconds.",
  errorLabel: "error",
  // format picker
  sourceLocked: "source locked",
  videoMp4: "video — mp4",
  audioMp3: "audio — mp3",
  audioChip: "mp3 · audio",
  cancel: "cancel",
  download: (label: string) => `DOWNLOAD ${label}`,
  pickFormat: "PICK A FORMAT",
  // download progress
  handingOff: "handing off to your browser",
  serverConverting:
    "The server is fetching and converting the file. Large videos can take a minute before your browser shows the save dialog.",
  sentToBrowser: "sent to your browser",
  nothingAppeared:
    "Nothing appeared? It may still be converting — give it a moment, then check your downloads folder.",
  anotherQuality: "another quality",
  grabAnother: "GRAB ANOTHER LINK",
  // history
  archive: (count: number) => `archive — last ${count} ${count === 1 ? "save" : "saves"}`,
  clear: "clear",
  // sections
  howTitle: "How it works",
  steps: [
    {
      title: "Paste your link",
      body: "Drop any video URL into the box — the platform is detected automatically as you type.",
    },
    {
      title: "Choose format & quality",
      body: "Every MP4 resolution and MP3 bitrate the source offers, fetched live with real file sizes.",
    },
    {
      title: "Download instantly",
      body: "Your browser saves the file straight to your downloads folder. No accounts, no waiting rooms.",
    },
  ],
  features: [
    {
      title: "All platforms supported",
      body: "YouTube, Instagram, TikTok, X, and Facebook — one box handles all of them.",
    },
    {
      title: "MP4 + MP3 formats",
      body: "Save the full video, or pull just the audio track — converted and ready to play anywhere.",
    },
    {
      title: "Every quality",
      body: "From 144p up to 4K 60fps — whatever the source offers shows up in the picker.",
    },
    {
      title: "Fast & private",
      body: "Files stream straight to your browser and are wiped from the server the moment they're sent.",
    },
  ],
  showcaseTitle: "Every format, one click away",
  showcaseSub:
    "The picker shows exactly what the source offers — real resolutions, real file sizes, nothing upscaled or faked.",
  // footer
  builtPrefix: "Built by Adnan · ",
  builtSuffix: " on X",
  footerRight: "For personal use only. Respect creators.",
  // download status bar
  downloadingNote: "Downloading… check your Downloads folder",
  dismiss: "Dismiss",
};

export type Dict = typeof en;

const ar: Dict = {
  tryFree: "جرّبه مجاناً",
  switchToLight: "التبديل إلى الوضع الفاتح",
  switchToDark: "التبديل إلى الوضع الداكن",
  switchLang: "Switch to English",
  headline: "حمّل مقاطع الفيديو والصوت",
  headlineAccent: "فوراً",
  sub: "الصق رابطاً من يوتيوب أو إنستغرام أو تيك توك أو X أو فيسبوك. اختر الجودة. حمّل في ثوانٍ.",
  placeholder: "الصق رابط الفيديو هنا…",
  grab: "جلب",
  urlAria: "رابط الفيديو",
  videosSaved: (count: string) => `تم حفظ ${count} فيديو`,
  contacting: (name: string) => `جارٍ الاتصال بـ ${name}`,
  genericSource: "المصدر",
  readingFormats: "جارٍ قراءة الصيغ المتاحة — قد تستغرق المصادر البطيئة نحو 10 ثوانٍ.",
  errorLabel: "خطأ",
  sourceLocked: "تم تحديد المصدر",
  videoMp4: "الفيديو — MP4",
  audioMp3: "الصوت — MP3",
  audioChip: "MP3 · صوت",
  cancel: "إلغاء",
  download: (label: string) => `تحميل ${label}`,
  pickFormat: "اختر صيغة",
  handingOff: "جارٍ التسليم إلى متصفحك",
  serverConverting:
    "يقوم الخادم بجلب الملف وتحويله. قد تستغرق الفيديوهات الكبيرة دقيقة قبل أن يعرض متصفحك نافذة الحفظ.",
  sentToBrowser: "تم الإرسال إلى متصفحك",
  nothingAppeared: "لم يظهر شيء؟ قد يكون التحويل جارياً — انتظر لحظة ثم تحقق من مجلد التنزيلات.",
  anotherQuality: "جودة أخرى",
  grabAnother: "جلب رابط آخر",
  archive: (count: number) => `الأرشيف — آخر ${count} تنزيل`,
  clear: "مسح",
  howTitle: "كيف يعمل",
  steps: [
    {
      title: "الصق الرابط",
      body: "أسقط رابط أي فيديو في الحقل — يتم اكتشاف المنصة تلقائياً أثناء الكتابة.",
    },
    {
      title: "اختر الصيغة والجودة",
      body: "كل دقات MP4 ومعدلات MP3 التي يوفرها المصدر، تُجلب مباشرة مع أحجام الملفات الحقيقية.",
    },
    {
      title: "حمّل فوراً",
      body: "يحفظ متصفحك الملف مباشرة في مجلد التنزيلات. بلا حسابات وبلا انتظار.",
    },
  ],
  features: [
    {
      title: "جميع المنصات مدعومة",
      body: "يوتيوب وإنستغرام وتيك توك وX وفيسبوك — حقل واحد يكفيها جميعاً.",
    },
    {
      title: "صيغ MP4 و MP3",
      body: "احفظ الفيديو كاملاً، أو استخرج الصوت فقط — محوّل وجاهز للتشغيل في أي مكان.",
    },
    {
      title: "كل جودة",
      body: "من 144p حتى 4K 60fps — كل ما يوفره المصدر يظهر في القائمة.",
    },
    {
      title: "سريع وخاص",
      body: "تُرسل الملفات مباشرة إلى متصفحك وتُمسح من الخادم فور إرسالها.",
    },
  ],
  showcaseTitle: "كل صيغة بنقرة واحدة",
  showcaseSub:
    "تعرض القائمة ما يوفره المصدر بالضبط — دقات حقيقية وأحجام ملفات حقيقية، لا شيء مزيّف أو مكبّر.",
  builtPrefix: "بناه عدنان · ",
  builtSuffix: " على X",
  footerRight: "للاستخدام الشخصي فقط. احترم أصحاب المحتوى.",
  downloadingNote: "جارٍ التنزيل… تحقق من مجلد التنزيلات",
  dismiss: "إغلاق",
};

export const STRINGS: Record<Lang, Dict> = { en, ar };

const LangContext = createContext<Lang>("en");

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useLang(): Lang {
  return useContext(LangContext);
}

export function useT(): Dict {
  return STRINGS[useLang()];
}

// Error state stores canonical English strings (logic unchanged); Arabic is a
// display-time lookup so toggling language re-localizes an already-shown error.
const AR_ERRORS: Record<string, string> = {
  "That doesn't look like a valid video link.": "هذا لا يبدو رابط فيديو صالحاً.",
  "This platform isn't supported yet.": "هذه المنصة غير مدعومة بعد.",
  "This video is private or age-restricted.": "هذا الفيديو خاص أو مقيّد بالعمر.",
  "Too many requests — wait a moment and try again.": "طلبات كثيرة جداً — انتظر لحظة وحاول مجدداً.",
  "Something went wrong. Try again or paste a different link.":
    "حدث خطأ ما. حاول مجدداً أو الصق رابطاً آخر.",
  "Can't reach the download server — is it running?":
    "تعذر الوصول إلى خادم التنزيل — هل هو يعمل؟",
  "The server took too long to respond — try again.":
    "استغرق الخادم وقتاً طويلاً في الرد — حاول مجدداً.",
};

export function localizeError(message: string, lang: Lang): string {
  if (lang !== "ar") return message;
  return AR_ERRORS[message] ?? message;
}
