"""yt-dlp wrapper: extracts video metadata and downloads media to temp files."""

from __future__ import annotations

import logging
import os
import re
import shutil
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import yt_dlp

logger = logging.getLogger("saveit")

MAX_URL_LENGTH = 2048
FORMAT_ID_RE = re.compile(r"^[A-Za-z0-9_.+-]{1,64}$")
MP3_FORMAT_RE = re.compile(r"^mp3-(320|192|128)$")
MP3_BITRATES = (320, 192, 128)
BEST_FORMAT_ID = "best"

# Source path for the logged-in YouTube cookie export. Production supplies this
# via a Render Secret File (uploaded as "cookies.txt", mounted at /etc/secrets/).
COOKIE_FILE = os.getenv("YTDLP_COOKIES_FILE", "/etc/secrets/cookies.txt")

PLATFORM_DOMAINS: dict[str, tuple[str, ...]] = {
    "youtube": ("youtube.com", "youtu.be"),
    "instagram": ("instagram.com",),
    "tiktok": ("tiktok.com",),
    "twitter": ("twitter.com", "x.com"),
    "facebook": ("facebook.com", "fb.watch", "fb.com"),
}

CONTENT_TYPES = {
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mkv": "video/x-matroska",
    ".mp3": "audio/mpeg",
    ".m4a": "audio/mp4",
}


class DownloadServiceError(Exception):
    """Error that maps to a clean JSON response instead of a 500 traceback."""

    status_code = 500

    def __init__(self, detail: str):
        super().__init__(detail)
        self.detail = detail


class InvalidURL(DownloadServiceError):
    status_code = 400


class VideoUnavailable(DownloadServiceError):
    status_code = 403


class ExtractionFailed(DownloadServiceError):
    status_code = 422


class ServerMisconfigured(DownloadServiceError):
    status_code = 500


@dataclass
class DownloadResult:
    path: Path
    filename: str
    content_type: str
    tmpdir: Path

    def cleanup(self) -> None:
        shutil.rmtree(self.tmpdir, ignore_errors=True)


def detect_platform(url: str) -> str | None:
    if not url or len(url) > MAX_URL_LENGTH:
        return None
    try:
        parsed = urlparse(url.strip())
    except ValueError:
        return None
    if parsed.scheme not in ("http", "https"):
        return None
    host = (parsed.hostname or "").lower()
    for platform, domains in PLATFORM_DOMAINS.items():
        if any(host == d or host.endswith("." + d) for d in domains):
            return platform
    return None


def get_video_info(url: str) -> dict:
    """Return title, thumbnail, duration, platform and downloadable formats."""
    platform = _require_platform(url)
    info = _extract_info(url, _base_opts())
    if info.get("is_live"):
        raise ExtractionFailed("Live streams can't be downloaded.")
    formats = _video_formats(info) + _audio_formats(info)
    if not formats:
        raise ExtractionFailed("No downloadable formats were found for this video.")
    return {
        "title": info.get("title") or "Untitled video",
        "thumbnail": _thumbnail(info),
        "duration": int(info["duration"]) if info.get("duration") else None,
        "platform": platform,
        "formats": formats,
    }


def download_media(url: str, format_id: str, media_type: str) -> DownloadResult:
    """Download to a unique temp dir; caller streams the file then calls cleanup()."""
    _require_platform(url)
    if media_type not in ("mp4", "mp3"):
        raise InvalidURL("type must be 'mp4' or 'mp3'.")
    if not FORMAT_ID_RE.match(format_id or ""):
        raise InvalidURL("Invalid format_id.")

    tmpdir = Path(tempfile.mkdtemp(prefix="saveit-"))
    try:
        if media_type == "mp3":
            info, path = _download_mp3(url, format_id, tmpdir)
        else:
            info, path = _download_mp4(url, format_id, tmpdir)
        title = _safe_filename(info.get("title") or media_type)
        return DownloadResult(
            path=path,
            filename=f"{title}{path.suffix}",
            content_type=CONTENT_TYPES.get(path.suffix, "application/octet-stream"),
            tmpdir=tmpdir,
        )
    except BaseException:
        shutil.rmtree(tmpdir, ignore_errors=True)
        raise


def _download_mp3(url: str, format_id: str, tmpdir: Path) -> tuple[dict, Path]:
    match = MP3_FORMAT_RE.match(format_id)
    if not match:
        raise InvalidURL("Invalid MP3 format — expected mp3-320, mp3-192 or mp3-128.")
    if not _has_ffmpeg():
        raise ServerMisconfigured("MP3 conversion requires ffmpeg on the server.")
    opts = {
        **_base_opts(),
        "outtmpl": str(tmpdir / "download.%(ext)s"),
        "format": "bestaudio/best",
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": match.group(1),
            }
        ],
    }
    info = _extract_info(url, opts, download=True)
    return info, _output_file(tmpdir, ".mp3")


def _download_mp4(url: str, format_id: str, tmpdir: Path) -> tuple[dict, Path]:
    selector = _mp4_selector(url, format_id)
    if "+" in selector and not _has_ffmpeg():
        raise ServerMisconfigured(
            "This quality needs ffmpeg on the server to merge video and audio — "
            "install ffmpeg or pick a lower quality."
        )
    opts = {
        **_base_opts(),
        "outtmpl": str(tmpdir / "download.%(ext)s"),
        "format": selector,
        "merge_output_format": "mp4",
    }
    if _has_ffmpeg():
        # Remux odd containers (e.g. the "best" fallback) into real MP4; no-op
        # when the file is already MP4.
        opts["postprocessors"] = [{"key": "FFmpegVideoRemuxer", "preferedformat": "mp4"}]
    info = _extract_info(url, opts, download=True)
    return info, _output_file(tmpdir, ".mp4")


def _mp4_selector(url: str, format_id: str) -> str:
    """Pick the yt-dlp format selector, merging in audio for video-only streams."""
    if format_id == BEST_FORMAT_ID:
        return "best"
    probe = _extract_info(url, _base_opts())
    fmt = next(
        (f for f in probe.get("formats") or [] if str(f.get("format_id")) == format_id),
        None,
    )
    if fmt is None:
        raise ExtractionFailed("The selected quality is no longer available — fetch the link again.")
    if (fmt.get("acodec") or "") == "none":
        return f"{format_id}+bestaudio[ext=m4a]/{format_id}+bestaudio/{format_id}"
    return format_id


def _video_formats(info: dict) -> list[dict]:
    # One entry per (height, high-fps) pair, preferring h264 for compatibility.
    candidates: dict[tuple[int, int], dict] = {}
    all_formats = info.get("formats") or []
    for fmt in all_formats:
        if (fmt.get("vcodec") or "none") == "none":
            continue
        if fmt.get("ext") != "mp4" or not fmt.get("format_id"):
            continue
        height = fmt.get("height")
        if not height:
            continue
        fps = round(fmt.get("fps") or 0)
        key = (height, fps if fps > 40 else 0)
        current = candidates.get(key)
        if current is None or _format_rank(fmt) > _format_rank(current):
            candidates[key] = fmt

    entries = []
    for (height, fps), fmt in sorted(candidates.items(), reverse=True):
        entries.append(
            {
                "format_id": str(fmt["format_id"]),
                "ext": "mp4",
                "height": height,
                "filesize_approx": fmt.get("filesize") or fmt.get("filesize_approx"),
                "label": f"{height}p{fps}" if fps else f"{height}p",
            }
        )
    if not entries and any((f.get("vcodec") or "none") != "none" for f in all_formats):
        # No plain MP4 streams (some Instagram/Facebook videos) — offer yt-dlp's
        # "best" muxed stream and remux it to MP4 at download time.
        entries.append(
            {
                "format_id": BEST_FORMAT_ID,
                "ext": "mp4",
                "height": None,
                "filesize_approx": None,
                "label": "Best quality",
            }
        )
    return entries


def _audio_formats(info: dict) -> list[dict]:
    formats = info.get("formats") or []
    # acodec None means "unknown" — only drop MP3 when every stream is explicitly silent.
    has_audio = not formats or any((f.get("acodec") or "") != "none" for f in formats)
    if not has_audio:
        return []
    return [
        {
            "format_id": f"mp3-{abr}",
            "ext": "mp3",
            "abr": abr,
            "filesize_approx": None,
            "label": f"MP3 {abr}kbps",
        }
        for abr in MP3_BITRATES
    ]


def _format_rank(fmt: dict) -> tuple:
    vcodec = fmt.get("vcodec") or ""
    return (1 if vcodec.startswith(("avc", "h264")) else 0, fmt.get("tbr") or 0)


def _thumbnail(info: dict) -> str | None:
    if info.get("thumbnail"):
        return info["thumbnail"]
    thumbnails = info.get("thumbnails") or []
    return thumbnails[-1].get("url") if thumbnails else None


def _extract_info(url: str, opts: dict[str, Any], download: bool = False) -> dict:
    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(url, download=download)
    except yt_dlp.utils.YoutubeDLError as exc:
        # TEMP DIAGNOSTIC: surface the real yt-dlp error in Render logs.
        logger.error(f"Raw yt-dlp error for {url}: {exc}")
        raise _map_yt_error(exc) from exc
    except DownloadServiceError:
        raise
    except Exception as exc:
        raise ExtractionFailed("Couldn't process this video — try a different link.") from exc
    if info is None:
        raise ExtractionFailed("Couldn't read any video at this link.")
    return _first_video(info)


def _first_video(info: dict) -> dict:
    entries = info.get("entries")
    if entries is None:
        return info
    entries = [entry for entry in entries if entry]
    if not entries:
        raise ExtractionFailed("No video found at this link.")
    return entries[0]


def _map_yt_error(exc: Exception) -> DownloadServiceError:
    msg = str(exc).lower()

    def has(*needles: str) -> bool:
        return any(needle in msg for needle in needles)

    if has("confirm you're not a bot", "confirm you are not a bot"):
        return VideoUnavailable(
            "The platform is rate-limiting the server right now — try again in a few minutes."
        )
    if has(
        "private",
        "login required",
        "sign in",
        "logged in",
        "age-restricted",
        "age restricted",
        "confirm your age",
        "registered users",
        "not available in your country",
        "geo restricted",
        "geo-restricted",
        "drm",
    ):
        return VideoUnavailable("This video is private, age-restricted, or blocked for the server.")
    if has("unsupported url", "not a valid url", "no video"):
        return InvalidURL("Invalid or unsupported video URL.")
    if has("unavailable", "removed", "does not exist", "404", "not found", "terminated"):
        return ExtractionFailed("This video is unavailable or has been removed.")
    return ExtractionFailed("Couldn't process this video — try a different link or quality.")


def _base_opts() -> dict[str, Any]:
    opts: dict[str, Any] = {
        "quiet": True,
        "no_warnings": True,
        "noprogress": True,
        "noplaylist": True,
        "playlist_items": "1",
        "socket_timeout": 30,
        "retries": 3,
    }
    cookie_file = _cookie_file()
    if cookie_file:
        opts["cookiefile"] = cookie_file
    return opts


def _cookie_file() -> str | None:
    """Writable copy of the browser-cookie export, if one is configured.

    YouTube challenges datacenter IPs, so production supplies a logged-in
    session via a Render Secret File. yt-dlp rewrites the cookie jar after
    each run and Render mounts secrets read-only — hence the /tmp copy.
    Absent file means no-op (local dev, other platforms).
    """
    source = COOKIE_FILE
    if not os.path.isfile(source):
        return None
    writable = Path(tempfile.gettempdir()) / "saveit-cookies.txt"
    if not writable.exists():
        shutil.copyfile(source, writable)
    return str(writable)


def _require_platform(url: str) -> str:
    platform = detect_platform(url)
    if platform is None:
        raise InvalidURL("Invalid or unsupported video URL.")
    return platform


def _has_ffmpeg() -> bool:
    return shutil.which("ffmpeg") is not None


def _output_file(tmpdir: Path, preferred_suffix: str) -> Path:
    exact = tmpdir / f"download{preferred_suffix}"
    if exact.is_file():
        return exact
    files = sorted(path for path in tmpdir.iterdir() if path.is_file())
    if not files:
        raise ExtractionFailed("The download produced no file — try a different quality.")
    for path in files:
        if path.suffix == preferred_suffix:
            return path
    return files[0]


def _safe_filename(title: str) -> str:
    clean = re.sub(r'[\\/:*?"<>|\x00-\x1f]', "", title)
    clean = re.sub(r"\s+", " ", clean).strip().strip(".")
    return clean[:120] or "download"
