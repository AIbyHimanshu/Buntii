from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import csv
import hashlib
import io
import ipaddress
import logging
import os
import re
import secrets
from datetime import datetime, timedelta, timezone
from html import escape
from html.parser import HTMLParser
from typing import List, Optional
from urllib.parse import urlparse

import bcrypt
import httpx
import jwt
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request
from fastapi.responses import Response
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from starlette.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# ---------- Config ----------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_TABLE = "waitlist_signups"

TURNSTILE_SECRET_KEY = os.environ.get("TURNSTILE_SECRET_KEY", "")
TURNSTILE_SITE_KEY_EXPECTED = bool(TURNSTILE_SECRET_KEY)

EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY", "")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "Buntii")

POSTHOG_PROJECT_TOKEN = os.environ.get("POSTHOG_PROJECT_TOKEN", "").strip()
POSTHOG_HOST = os.environ.get("POSTHOG_HOST", "https://us.i.posthog.com").rstrip("/")

ph = None
if POSTHOG_PROJECT_TOKEN:
    try:
        from posthog import Posthog
        ph = Posthog(POSTHOG_PROJECT_TOKEN, host=POSTHOG_HOST)
    except Exception as e:
        logger.warning(f"PostHog init failed, analytics disabled: {e}")

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ---------- Models ----------
SIGNUP_FIELDS = [
    "id", "first_name", "email", "role", "postcode", "shop_name", "shop_type",
    "phone_whatsapp", "source", "utm_source", "utm_medium", "utm_campaign",
    "referral_code", "referred_by", "created_at",
]

UK_POSTCODE = re.compile(r"^([A-Za-z]{1,2}\d[A-Za-z\d]?)\s*(\d[A-Za-z]{2})$")


class WaitlistIn(BaseModel):
    first_name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    role: str = Field(pattern="^(shopper|trader)$")
    postcode: str = Field(min_length=5, max_length=8)
    source: Optional[str] = Field(default=None, max_length=80)
    utm_source: Optional[str] = Field(default=None, max_length=120)
    utm_medium: Optional[str] = Field(default=None, max_length=120)
    utm_campaign: Optional[str] = Field(default=None, max_length=120)
    referred_by: Optional[str] = Field(default=None, max_length=40)
    turnstile_token: Optional[str] = Field(default=None, max_length=2048)


class TraderDetailsIn(BaseModel):
    email: EmailStr
    shop_name: str = Field(min_length=1, max_length=120)
    shop_type: str = Field(min_length=1, max_length=60)
    phone_whatsapp: Optional[str] = Field(default=None, max_length=30)


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=200)


# ---------- Auth ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_admin(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    token = auth[7:] if auth.startswith("Bearer ") else request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    admin = await db.admins.find_one({"email": payload.get("email")}, {"_id": 0, "password_hash": 0})
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    return admin


async def seed_admin():
    if not ADMIN_EMAIL or not ADMIN_PASSWORD:
        logger.warning("ADMIN_EMAIL/ADMIN_PASSWORD not set; admin login disabled")
        return
    email = ADMIN_EMAIL.lower()
    existing = await db.admins.find_one({"email": email})
    if existing is None:
        await db.admins.insert_one({
            "email": email,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "Buntii Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded admin {email}")
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.admins.update_one({"email": email}, {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}})
        logger.info(f"Updated admin password for {email}")


# ---------- Email guardrail gate (per Resend playbook) ----------
_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")


async def send_email(*, to: str, subject: str, html: str) -> Optional[str]:
    if not EMAIL_KEY:
        logger.info("EMERGENT_EMAIL_KEY not set; skipping email")
        return None
    _assert_safe_email(subject, html)
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    try:
        async with httpx.AsyncClient(timeout=30) as client_http:
            resp = await client_http.post(
                f"{EMAIL_BASE_URL}/api/v1/email/send",
                headers={"X-Email-Key": EMAIL_KEY},
                json=payload,
            )
        resp.raise_for_status()
        return resp.json().get("id")
    except Exception as e:
        logger.error(f"Email send failed: {e}")
        return None


def waitlist_email_html(first_name: str, role: str, referral_code: str) -> str:
    name = escape(first_name)
    if role == "trader":
        line1 = "You're on the trader list. We start onboarding on Green Lanes first, shop by shop, in person."
        line2 = "When your corridor switches on, you'll hear from us before anyone else."
    else:
        line1 = "You're on the list. When your street switches on, you'll be the first to know what's reduced, right now, down your road."
        line2 = "No mystery bags. No supermarket-only deals. Just the good stuff."
    return (
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
        'style="background:#FFF4F0;padding:32px 0"><tr><td align="center">'
        '<table role="presentation" width="560" cellpadding="0" cellspacing="0" '
        'style="background:#FFFFFF;border:1px solid #E3EAE6;border-radius:16px;padding:36px;'
        "font-family:Arial,sans-serif;color:#0A2A22\">"
        '<tr><td><p style="font-size:22px;font-weight:800;color:#16584A;margin:0 0 4px">'
        'Bunt<span style="color:#FF6A4D">ii</span><span style="color:#4ABB92">.</span></p>'
        '<p style="font-size:12px;letter-spacing:2px;color:#5A665F;margin:0 0 24px">TRUST YOUR AUNTIE.</p>'
        f'<h1 style="font-size:24px;margin:0 0 12px;color:#0A2A22">Lovely to have you, {name}.</h1>'
        f'<p style="font-size:15px;line-height:1.6;margin:0 0 10px">{line1}</p>'
        f'<p style="font-size:15px;line-height:1.6;margin:0 0 20px">{line2}</p>'
        '<p style="font-size:14px;line-height:1.6;margin:0 0 6px">Know someone who watches the yellow stickers '
        'like a hawk? Bring them in:</p>'
        f'<p style="font-size:14px;margin:0 0 24px"><a href="https://buntii.co.uk/?ref={escape(referral_code)}" '
        'style="color:#16584A;font-weight:700">Your referral link</a></p>'
        '<p style="font-size:12px;color:#5A665F;margin:0">Sent by Buntii. We never ask for passwords or card '
        "details by email.</p></td></tr></table></td></tr></table>"
    )


# ---------- Analytics ----------
def capture(distinct_key: str, event: str, properties: dict):
    if not ph:
        return
    try:
        distinct_id = "waitlist_" + hashlib.sha256(distinct_key.encode()).hexdigest()[:32]
        ph.capture(event, distinct_id=distinct_id, properties=properties)
    except Exception as e:
        logger.warning(f"PostHog capture failed: {e}")


# ---------- Turnstile ----------
async def verify_turnstile(token: Optional[str], request: Request) -> bool:
    if not TURNSTILE_SECRET_KEY:
        return True  # graceful degradation until keys are configured
    if not token:
        return False
    remote_ip = request.client.host if request.client else None
    try:
        async with httpx.AsyncClient(timeout=5.0) as client_http:
            resp = await client_http.post(
                "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                json={"secret": TURNSTILE_SECRET_KEY, "response": token, "remoteip": remote_ip},
            )
        return bool(resp.json().get("success"))
    except Exception:
        logger.exception("Turnstile verification error")
        return True  # fail-open on network error


# ---------- Waitlist storage: Supabase when configured, MongoDB until then ----------
def supabase_ready() -> bool:
    return bool(SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)


def _sb_headers(prefer: str = "return=minimal") -> dict:
    return {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": prefer,
    }


async def store_signup(doc: dict) -> str:
    if supabase_ready():
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.post(f"{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}", headers=_sb_headers(), json=doc)
        if r.status_code == 409:
            return "duplicate"
        r.raise_for_status()
        return "created"
    existing = await db.waitlist_signups.find_one({"email": doc["email"]})
    if existing:
        return "duplicate"
    await db.waitlist_signups.insert_one(doc)
    return "created"


async def update_trader_details(email: str, details: dict) -> bool:
    if supabase_ready():
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.patch(
                f"{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}?email=eq.{email}",
                headers=_sb_headers(),
                json=details,
            )
        r.raise_for_status()
        return True
    res = await db.waitlist_signups.update_one({"email": email}, {"$set": details})
    return res.matched_count > 0


async def query_signups(filters: dict) -> List[dict]:
    if supabase_ready():
        params = {"select": ",".join(SIGNUP_FIELDS), "order": "created_at.desc", "limit": "5000"}
        if filters.get("role"):
            params["role"] = f"eq.{filters['role']}"
        if filters.get("postcode"):
            params["postcode"] = f"ilike.{filters['postcode']}*"
        if filters.get("source"):
            params["source"] = f"eq.{filters['source']}"
        if filters.get("referral_code"):
            params["referral_code"] = f"eq.{filters['referral_code']}"
        if filters.get("date_from"):
            params["created_at"] = f"gte.{filters['date_from']}"
        async with httpx.AsyncClient(timeout=20) as c:
            r = await c.get(f"{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}", headers=_sb_headers(), params=params)
        r.raise_for_status()
        rows = r.json()
        q = (filters.get("q") or "").lower()
        if q:
            rows = [x for x in rows if q in (x.get("email") or "").lower() or q in (x.get("first_name") or "").lower()]
        return rows

    mongo_q = {}
    if filters.get("role"):
        mongo_q["role"] = filters["role"]
    if filters.get("postcode"):
        mongo_q["postcode"] = {"$regex": f"^{re.escape(filters['postcode'])}", "$options": "i"}
    if filters.get("source"):
        mongo_q["source"] = filters["source"]
    if filters.get("referral_code"):
        mongo_q["referral_code"] = filters["referral_code"]
    if filters.get("date_from"):
        mongo_q["created_at"] = {"$gte": filters["date_from"]}
    if filters.get("date_to"):
        mongo_q.setdefault("created_at", {})["$lte"] = filters["date_to"] + "T23:59:59"
    if filters.get("q"):
        rx = {"$regex": re.escape(filters["q"]), "$options": "i"}
        mongo_q["$or"] = [{"email": rx}, {"first_name": rx}]
    rows = await db.waitlist_signups.find(mongo_q, {"_id": 0}).sort("created_at", -1).to_list(5000)
    return rows


# ---------- Routes: waitlist ----------
@api_router.get("/")
async def root():
    return {"message": "Buntii API"}


@api_router.get("/health")
async def health():
    return {"ok": True, "store": "supabase" if supabase_ready() else "mongodb"}


@api_router.post("/waitlist", status_code=201)
async def join_waitlist(payload: WaitlistIn, request: Request):
    if not UK_POSTCODE.match(payload.postcode.strip()):
        raise HTTPException(status_code=422, detail="Needs a full postcode.")
    if not await verify_turnstile(payload.turnstile_token, request):
        raise HTTPException(status_code=400, detail="Verification failed. Please try again.")

    email = str(payload.email).lower().strip()
    doc = {
        "id": str(__import__("uuid").uuid4()),
        "first_name": payload.first_name.strip(),
        "email": email,
        "role": payload.role,
        "postcode": payload.postcode.strip().upper(),
        "shop_name": None,
        "shop_type": None,
        "phone_whatsapp": None,
        "source": payload.source or "homepage",
        "utm_source": payload.utm_source,
        "utm_medium": payload.utm_medium,
        "utm_campaign": payload.utm_campaign,
        "referral_code": secrets.token_urlsafe(5),
        "referred_by": payload.referred_by,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    if supabase_ready():
        doc.pop("id", None)  # let Postgres generate the uuid
    status = await store_signup(doc)

    if status == "created":
        html = waitlist_email_html(doc["first_name"], doc["role"], doc["referral_code"])
        import asyncio
        asyncio.create_task(send_email(to=email, subject="You're on the Buntii waitlist", html=html))
        asyncio.create_task(asyncio.to_thread(capture, email, "waitlist_completed", {"role": doc["role"], "source": doc["source"]}))
        asyncio.create_task(asyncio.to_thread(capture, email, f"{doc['role']}_signup", {"postcode_area": doc["postcode"].split()[0]}))
        return {"ok": True, "status": "created", "role": doc["role"], "referral_code": doc["referral_code"]}

    existing_code = None
    if not supabase_ready():
        existing = await db.waitlist_signups.find_one({"email": email}, {"_id": 0, "referral_code": 1})
        existing_code = (existing or {}).get("referral_code")
    return {"ok": True, "status": "duplicate", "role": doc["role"], "referral_code": existing_code}


@api_router.post("/waitlist/details")
async def trader_details(payload: TraderDetailsIn):
    email = str(payload.email).lower().strip()
    details = {
        "shop_name": payload.shop_name.strip(),
        "shop_type": payload.shop_type.strip(),
        "phone_whatsapp": (payload.phone_whatsapp or "").strip() or None,
    }
    updated = await update_trader_details(email, details)
    if not updated:
        raise HTTPException(status_code=404, detail="We couldn't find that email on the list.")
    capture(email, "trader_details_completed", {"shop_type": details["shop_type"]})
    return {"ok": True}


# ---------- Routes: auth ----------
@api_router.post("/auth/login")
async def login(payload: LoginIn):
    email = str(payload.email).lower().strip()
    admin = await db.admins.find_one({"email": email})
    if not admin or not verify_password(payload.password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Wrong email or password.")
    token = create_access_token(email, email)
    return {"access_token": token, "admin": {"email": email, "name": admin.get("name", "Admin")}}


@api_router.get("/auth/me")
async def me(admin=Depends(get_current_admin)):
    return admin


@api_router.post("/auth/logout")
async def logout():
    return {"ok": True}


# ---------- Routes: admin ----------
def build_filters(role, q, postcode, source, referral_code, date_from, date_to):
    return {
        "role": role, "q": q, "postcode": postcode, "source": source,
        "referral_code": referral_code, "date_from": date_from, "date_to": date_to,
    }


@api_router.get("/admin/signups")
async def admin_signups(
    role: Optional[str] = None, q: Optional[str] = None, postcode: Optional[str] = None,
    source: Optional[str] = None, referral_code: Optional[str] = None,
    date_from: Optional[str] = None, date_to: Optional[str] = None,
    admin=Depends(get_current_admin),
):
    rows = await query_signups(build_filters(role, q, postcode, source, referral_code, date_from, date_to))
    return {"rows": rows, "total": len(rows)}


@api_router.get("/admin/export.csv")
async def export_csv(
    role: Optional[str] = None, q: Optional[str] = None, postcode: Optional[str] = None,
    source: Optional[str] = None, referral_code: Optional[str] = None,
    date_from: Optional[str] = None, date_to: Optional[str] = None,
    admin=Depends(get_current_admin),
):
    rows = await query_signups(build_filters(role, q, postcode, source, referral_code, date_from, date_to))
    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=SIGNUP_FIELDS, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(rows)
    return Response(
        buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=buntii-waitlist.csv"},
    )


@api_router.get("/admin/export.xlsx")
async def export_xlsx(admin=Depends(get_current_admin)):
    from openpyxl import Workbook

    rows = await query_signups({})
    wb = Workbook()
    summary = wb.active
    summary.title = "Summary"
    shoppers = [r for r in rows if r.get("role") == "shopper"]
    traders = [r for r in rows if r.get("role") == "trader"]
    summary.append(["Buntii waitlist export", datetime.now(timezone.utc).isoformat()])
    summary.append(["Total signups", len(rows)])
    summary.append(["Shoppers", len(shoppers)])
    summary.append(["Traders", len(traders)])
    for sheet_name, sheet_rows in (("Shoppers", shoppers), ("Traders", traders)):
        ws = wb.create_sheet(sheet_name)
        ws.append(SIGNUP_FIELDS)
        for r in sheet_rows:
            ws.append([r.get(f) for f in SIGNUP_FIELDS])
    out = io.BytesIO()
    wb.save(out)
    return Response(
        out.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=buntii-waitlist.xlsx"},
    )


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.waitlist_signups.create_index("email", unique=True)
    await db.admins.create_index("email", unique=True)
    await seed_admin()


@app.on_event("shutdown")
async def shutdown():
    if ph:
        ph.shutdown()
    client.close()
