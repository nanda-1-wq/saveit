"""SaveIt API — /health, /info and /download on FastAPI + yt-dlp."""

import os

from dotenv import load_dotenv
from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from starlette.background import BackgroundTask

import downloader
from downloader import DownloadServiceError

load_dotenv()


def _client_ip(request: Request) -> str:
    # Railway terminates requests at its edge proxy, so the real client IP
    # arrives in X-Forwarded-For while request.client is the proxy itself.
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "anonymous"


def _allowed_origins() -> list[str]:
    # 3001 included because Next.js auto-increments when 3000 is taken.
    origins = {
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    }
    for origin in (os.getenv("ALLOWED_ORIGIN") or "").split(","):
        origin = origin.strip().rstrip("/")
        if origin:
            origins.add(origin)
    return sorted(origins)


limiter = Limiter(key_func=_client_ip)

app = FastAPI(title="SaveIt API", version="1.0.0")
app.state.limiter = limiter

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_methods=["GET"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)


@app.exception_handler(DownloadServiceError)
async def handle_download_error(request: Request, exc: DownloadServiceError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(RateLimitExceeded)
async def handle_rate_limit(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests — wait a moment and try again."},
    )


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/info")
@limiter.limit("10/minute")
def video_info(request: Request, url: str = Query(..., min_length=1)) -> dict:
    return downloader.get_video_info(url)


@app.get("/download")
@limiter.limit("5/minute")
def download(
    request: Request,
    url: str = Query(..., min_length=1),
    format_id: str = Query(..., min_length=1),
    media_type: str = Query(..., alias="type"),
):
    result = downloader.download_media(url, format_id, media_type)
    return FileResponse(
        path=result.path,
        media_type=result.content_type,
        filename=result.filename,
        background=BackgroundTask(result.cleanup),
    )
