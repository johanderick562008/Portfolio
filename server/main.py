"""
Contact endpoint for the portfolio.

One job: accept a validated message and email it to Johan over SMTP.
Nothing is stored. All configuration comes from environment variables
(see .env.example); the frontend only ever learns the endpoint URL.
"""

from __future__ import annotations

import logging
import os
import re
import smtplib
import time
from collections import defaultdict, deque
from email.message import EmailMessage

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator

log = logging.getLogger("contact")
logging.basicConfig(level=logging.INFO)


def env(name: str, default: str | None = None) -> str | None:
    value = os.getenv(name, default)
    return value.strip() if isinstance(value, str) else value


ALLOWED_ORIGINS = [o.strip() for o in (env("ALLOWED_ORIGINS", "http://localhost:5173") or "").split(",") if o.strip()]
RATE_LIMIT = int(env("RATE_LIMIT", "5") or 5)  # messages
RATE_WINDOW = int(env("RATE_WINDOW_SECONDS", "600") or 600)  # per this many seconds, per IP
MAX_BODY_BYTES = 8_000

app = FastAPI(title="JD portfolio contact", docs_url=None, redoc_url=None, openapi_url=None)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
    allow_credentials=False,
    max_age=600,
)

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$")
CONTROL_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


class ContactIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: str = Field(min_length=3, max_length=254)
    message: str = Field(min_length=10, max_length=2000)
    website: str = Field(default="", max_length=200)  # honeypot — must stay empty

    @field_validator("name", "email")
    @classmethod
    def single_line(cls, v: str) -> str:
        # CR/LF in header-bound fields would allow header injection.
        v = v.strip()
        if "\r" in v or "\n" in v or CONTROL_RE.search(v):
            raise ValueError("must be a single line of plain text")
        return v

    @field_validator("email")
    @classmethod
    def looks_like_email(cls, v: str) -> str:
        if not EMAIL_RE.match(v):
            raise ValueError("invalid email address")
        return v

    @field_validator("message")
    @classmethod
    def clean_message(cls, v: str) -> str:
        v = CONTROL_RE.sub("", v).strip()
        if len(v) < 10:
            raise ValueError("message too short")
        return v


# --- rate limiting --------------------------------------------------------
# In-memory sliding window. Good enough for a single small instance; on a
# multi-instance or serverless host, put a shared store (e.g. Redis) behind it.
_hits: dict[str, deque[float]] = defaultdict(deque)


def client_ip(request: Request) -> str:
    if env("TRUST_PROXY") == "1":
        fwd = request.headers.get("x-forwarded-for", "")
        if fwd:
            return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def allow(ip: str) -> bool:
    now = time.monotonic()
    q = _hits[ip]
    while q and now - q[0] > RATE_WINDOW:
        q.popleft()
    if len(q) >= RATE_LIMIT:
        return False
    q.append(now)
    return True


# --- delivery -------------------------------------------------------------
def smtp_configured() -> bool:
    return all(env(k) for k in ("SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "CONTACT_TO"))


def send(msg_in: ContactIn) -> None:
    msg = EmailMessage()
    msg["Subject"] = f"Portfolio message from {msg_in.name}"
    msg["From"] = env("CONTACT_FROM") or env("SMTP_USER")
    msg["To"] = env("CONTACT_TO")
    msg["Reply-To"] = msg_in.email
    msg.set_content(f"{msg_in.message}\n\n— {msg_in.name} <{msg_in.email}>")

    host = env("SMTP_HOST")
    port = int(env("SMTP_PORT", "587") or 587)
    with smtplib.SMTP(host, port, timeout=15) as s:
        s.starttls()
        s.login(env("SMTP_USER"), env("SMTP_PASSWORD"))
        s.send_message(msg)


@app.get("/health")
def health() -> dict:
    return {"ok": True, "delivery": "configured" if smtp_configured() else "not configured"}


@app.post("/contact", status_code=202)
async def contact(request: Request) -> JSONResponse:
    raw = await request.body()
    if len(raw) > MAX_BODY_BYTES:
        raise HTTPException(status_code=413, detail="Message too large.")

    ip = client_ip(request)
    if not allow(ip):
        raise HTTPException(status_code=429, detail="Too many messages. Try again later.")

    try:
        data = ContactIn.model_validate_json(raw)
    except Exception:
        raise HTTPException(status_code=422, detail="Please check the form fields.") from None

    # Bots fill the hidden field; pretend success so they learn nothing.
    if data.website:
        return JSONResponse({"ok": True}, status_code=202)

    if not smtp_configured():
        raise HTTPException(status_code=503, detail="Contact delivery is not configured.")

    try:
        send(data)
    except Exception:
        log.exception("contact delivery failed")  # no message content in logs
        raise HTTPException(status_code=502, detail="Could not deliver the message.") from None

    log.info("contact message delivered")
    return JSONResponse({"ok": True}, status_code=202)
