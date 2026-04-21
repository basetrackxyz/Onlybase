from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import logging
import secrets
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field, ConfigDict

import auth as auth_utils

# ---------- DB setup ----------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")


# ---------- Dependency ----------
async def get_current_user(request: Request) -> dict:
    return await auth_utils.get_current_user(request, db)


# ---------- Models ----------
class UserPublic(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: Optional[str] = None
    handle: Optional[str] = None
    name: Optional[str] = None
    avatar: Optional[str] = None
    bio: str = ""
    verified: bool = False
    auth_methods: List[str] = []
    farcaster_fid: Optional[int] = None
    wallet_address: Optional[str] = None


class RegisterPayload(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    name: Optional[str] = None


class LoginPayload(BaseModel):
    email: EmailStr
    password: str


class GoogleSessionPayload(BaseModel):
    session_id: str


class FarcasterAuthPayload(BaseModel):
    fid: int
    username: Optional[str] = None
    displayName: Optional[str] = None
    bio: Optional[str] = None
    pfpUrl: Optional[str] = None
    signature: str
    message: str
    nonce: str


class LinkFarcasterPayload(FarcasterAuthPayload):
    pass


class NonceResponse(BaseModel):
    nonce: str


# ---------- Basic ----------
@api_router.get("/")
async def root():
    return {"message": "OnlyBase API", "version": "0.1.0"}


# ---------- Auth: nonce ----------
@api_router.get("/auth/nonce", response_model=NonceResponse)
async def get_nonce():
    """Generate a nonce for SIWF. Client should include in the SIWF message."""
    return {"nonce": secrets.token_hex(16)}


# ---------- Auth: register ----------
@api_router.post("/auth/register", response_model=UserPublic)
async def register(payload: RegisterPayload, response: Response):
    email = payload.email.lower()
    # uniqueness
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    base_handle = email.split("@")[0]
    handle = await auth_utils.ensure_unique_handle(db, base_handle)

    doc = auth_utils.new_user_doc(
        email=email,
        handle=handle,
        name=payload.name or base_handle,
        password_hash=auth_utils.hash_password(payload.password),
        auth_methods=["email"],
    )
    await db.users.insert_one(doc)
    auth_utils.set_auth_cookies(response, doc["user_id"])
    doc.pop("password_hash", None)
    return UserPublic(**doc)


# ---------- Auth: login ----------
@api_router.post("/auth/login", response_model=UserPublic)
async def login(payload: LoginPayload, response: Response, request: Request):
    email = payload.email.lower()
    ip = request.client.host if request.client else "unknown"
    key = f"{ip}:{email}"

    # Brute-force check
    attempt = await db.login_attempts.find_one({"key": key})
    if attempt and attempt.get("count", 0) >= 5:
        locked_until = attempt.get("locked_until")
        if locked_until and datetime.fromisoformat(locked_until) > datetime.now(timezone.utc):
            raise HTTPException(status_code=429, detail="Too many attempts. Try again in 15 minutes.")

    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not auth_utils.verify_password(payload.password, user.get("password_hash") or ""):
        # increment attempts
        await db.login_attempts.update_one(
            {"key": key},
            {"$inc": {"count": 1}, "$set": {
                "locked_until": (datetime.now(timezone.utc).replace(microsecond=0)).isoformat()
                if False else (datetime.now(timezone.utc) + __import__("datetime").timedelta(minutes=15)).isoformat()
            }},
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # success -> clear attempts
    await db.login_attempts.delete_one({"key": key})
    auth_utils.set_auth_cookies(response, user["user_id"])
    user.pop("password_hash", None)
    return UserPublic(**user)


# ---------- Auth: logout ----------
@api_router.post("/auth/logout")
async def logout(response: Response):
    auth_utils.clear_auth_cookies(response)
    return {"ok": True}


# ---------- Auth: me ----------
@api_router.get("/auth/me", response_model=UserPublic)
async def me(user: dict = Depends(get_current_user)):
    return UserPublic(**user)


# ---------- Auth: refresh ----------
@api_router.post("/auth/refresh")
async def refresh(request: Request, response: Response):
    import jwt as _jwt
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = _jwt.decode(token, os.environ["JWT_SECRET"], algorithms=["HS256"])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = payload["sub"]
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        auth_utils.set_auth_cookies(response, user_id)
        return {"ok": True}
    except _jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except _jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


# ---------- Auth: Google (Emergent OAuth) ----------
@api_router.post("/auth/google", response_model=UserPublic)
async def google_auth(payload: GoogleSessionPayload, response: Response):
    """Exchange Emergent session_id for user info, then issue OUR JWT cookies."""
    data = await auth_utils.fetch_emergent_session(payload.session_id)
    if not data:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    google_id = data.get("id")
    email = (data.get("email") or "").lower()
    name = data.get("name") or email.split("@")[0]
    picture = data.get("picture")

    # Find existing: by google_id OR by email
    user = await db.users.find_one({"google_id": google_id}, {"_id": 0})
    if not user and email:
        user = await db.users.find_one({"email": email}, {"_id": 0})

    if user:
        # Link google if needed
        updates = {"updated_at": datetime.now(timezone.utc).isoformat()}
        if not user.get("google_id"):
            updates["google_id"] = google_id
        if "google" not in (user.get("auth_methods") or []):
            updates["auth_methods"] = list(set((user.get("auth_methods") or []) + ["google"]))
        if picture and not user.get("avatar"):
            updates["avatar"] = picture
        await db.users.update_one({"user_id": user["user_id"]}, {"$set": updates})
        user.update(updates)
    else:
        base_handle = email.split("@")[0] if email else f"gu{google_id[-6:]}"
        handle = await auth_utils.ensure_unique_handle(db, base_handle)
        user = auth_utils.new_user_doc(
            email=email or None,
            handle=handle,
            name=name,
            avatar=picture,
            google_id=google_id,
            auth_methods=["google"],
        )
        await db.users.insert_one(user)

    auth_utils.set_auth_cookies(response, user["user_id"])
    user.pop("password_hash", None)
    return UserPublic(**user)


# ---------- Auth: Farcaster ----------
@api_router.post("/auth/farcaster", response_model=UserPublic)
async def farcaster_auth(payload: FarcasterAuthPayload, response: Response):
    expected_domain = os.environ.get("APP_DOMAIN")
    ok, fid, err = auth_utils.verify_siwf_signature(
        message=payload.message,
        signature=payload.signature,
        expected_nonce=payload.nonce,
        expected_domain=expected_domain,
    )
    if not ok:
        raise HTTPException(status_code=401, detail=f"SIWF verification failed: {err}")
    if fid != payload.fid:
        raise HTTPException(status_code=401, detail="FID mismatch in signature")

    user = await db.users.find_one({"farcaster_fid": fid}, {"_id": 0})
    if user:
        updates = {
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "name": payload.displayName or user.get("name"),
            "avatar": payload.pfpUrl or user.get("avatar"),
        }
        if "farcaster" not in (user.get("auth_methods") or []):
            updates["auth_methods"] = list(set((user.get("auth_methods") or []) + ["farcaster"]))
        await db.users.update_one({"user_id": user["user_id"]}, {"$set": updates})
        user.update(updates)
    else:
        base_handle = payload.username or f"fc{fid}"
        handle = await auth_utils.ensure_unique_handle(db, base_handle)
        user = auth_utils.new_user_doc(
            handle=handle,
            name=payload.displayName or payload.username or f"fid-{fid}",
            avatar=payload.pfpUrl,
            bio=payload.bio or "",
            farcaster_fid=fid,
            auth_methods=["farcaster"],
        )
        await db.users.insert_one(user)

    auth_utils.set_auth_cookies(response, user["user_id"])
    user.pop("password_hash", None)
    return UserPublic(**user)


# ---------- Auth: Link Farcaster to logged-in account ----------
@api_router.post("/auth/farcaster/link", response_model=UserPublic)
async def link_farcaster(payload: LinkFarcasterPayload, response: Response,
                         current: dict = Depends(get_current_user)):
    expected_domain = os.environ.get("APP_DOMAIN")
    ok, fid, err = auth_utils.verify_siwf_signature(
        message=payload.message,
        signature=payload.signature,
        expected_nonce=payload.nonce,
        expected_domain=expected_domain,
    )
    if not ok or fid != payload.fid:
        raise HTTPException(status_code=401, detail=f"SIWF verification failed: {err or 'fid mismatch'}")

    # Check not already linked to another account
    existing = await db.users.find_one(
        {"farcaster_fid": fid, "user_id": {"$ne": current["user_id"]}},
        {"_id": 0},
    )
    if existing:
        raise HTTPException(status_code=409, detail="Farcaster account already linked to another user")

    updates = {
        "farcaster_fid": fid,
        "avatar": payload.pfpUrl or current.get("avatar"),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "auth_methods": list(set((current.get("auth_methods") or []) + ["farcaster"])),
    }
    await db.users.update_one({"user_id": current["user_id"]}, {"$set": updates})
    current.update(updates)
    return UserPublic(**current)


# ---------- Startup ----------
@app.on_event("startup")
async def startup():
    # Drop any stale indexes then recreate with partial filters so null values are excluded.
    for idx_name in ["email_1", "handle_1", "google_id_1", "farcaster_fid_1"]:
        try:
            await db.users.drop_index(idx_name)
        except Exception:
            pass

    await db.users.create_index(
        "email", unique=True,
        partialFilterExpression={"email": {"$type": "string"}},
    )
    await db.users.create_index(
        "handle", unique=True,
        partialFilterExpression={"handle": {"$type": "string"}},
    )
    await db.users.create_index(
        "google_id", unique=True,
        partialFilterExpression={"google_id": {"$type": "string"}},
    )
    await db.users.create_index(
        "farcaster_fid", unique=True,
        partialFilterExpression={"farcaster_fid": {"$type": "number"}},
    )
    await db.users.create_index("user_id", unique=True)
    await db.login_attempts.create_index("key", unique=True)

    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@onlybase.app").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email}, {"_id": 0})
    hashed = auth_utils.hash_password(admin_password)
    if not existing:
        doc = auth_utils.new_user_doc(
            email=admin_email,
            handle="admin",
            name="Admin",
            password_hash=hashed,
            auth_methods=["email"],
            role="admin",
            verified=True,
        )
        await db.users.insert_one(doc)
        logger.info("Seeded admin user: %s", admin_email)
    elif not auth_utils.verify_password(admin_password, existing.get("password_hash") or ""):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hashed}})
        logger.info("Updated admin password hash")


@app.on_event("shutdown")
async def shutdown():
    client.close()


# ---------- Mount router + CORS ----------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
