"""Auth utilities: password hashing, JWT creation/verification, user helpers."""
import os
import uuid
import bcrypt
import jwt
import httpx
import re
from typing import Optional
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, Request, Response
from eth_account.messages import encode_defunct
from eth_account import Account

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_MIN = 15
REFRESH_TOKEN_DAYS = 7


# ---------- Password hashing ----------
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password:
        return False
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


# ---------- JWT ----------
def _jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MIN),
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "type": "refresh",
        "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_DAYS),
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, user_id: str) -> None:
    access = create_access_token(user_id)
    refresh = create_refresh_token(user_id)
    # secure=True + samesite=none because we are cross-site in preview (frontend and backend same origin via ingress though)
    response.set_cookie(
        key="access_token", value=access, httponly=True, secure=True, samesite="none",
        max_age=ACCESS_TOKEN_MIN * 60, path="/"
    )
    response.set_cookie(
        key="refresh_token", value=refresh, httponly=True, secure=True, samesite="none",
        max_age=REFRESH_TOKEN_DAYS * 24 * 3600, path="/"
    )


def clear_auth_cookies(response: Response) -> None:
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")


async def get_current_user(request: Request, db) -> dict:
    """Extract user from access_token cookie (or Authorization Bearer)."""
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, _jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"user_id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------- User helpers ----------
def new_user_doc(**overrides) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "user_id": f"u_{uuid.uuid4().hex[:12]}",
        "email": None,
        "handle": None,
        "name": None,
        "avatar": None,
        "bio": "",
        "password_hash": None,
        "google_id": None,
        "farcaster_fid": None,
        "auth_methods": [],
        "verified": False,
        "role": "user",
        "wallet_address": None,
        "created_at": now,
        "updated_at": now,
    }
    doc.update(overrides)
    return doc


async def ensure_unique_handle(db, base: str) -> str:
    """Make sure a handle is unique; append numbers if needed."""
    if not base:
        base = f"user{uuid.uuid4().hex[:6]}"
    # normalize
    base = re.sub(r"[^a-zA-Z0-9_]", "", base).lower()[:20] or f"user{uuid.uuid4().hex[:6]}"
    candidate = base
    i = 1
    while await db.users.find_one({"handle": candidate}):
        candidate = f"{base}{i}"
        i += 1
    return candidate





# ---------- Farcaster SIWF verification ----------
FARCASTER_STATEMENT = "Farcaster Auth"


def verify_siwf_signature(message: str, signature: str, expected_nonce: str,
                          expected_domain: Optional[str] = None) -> tuple[bool, Optional[int], Optional[str]]:
    """Verify Sign In With Farcaster message.

    Returns (ok, fid, error).
    """
    try:
        # Validate statement
        if FARCASTER_STATEMENT not in message:
            return False, None, "Invalid statement"

        # Validate chain id is 10 (Optimism)
        chain_match = re.search(r"Chain ID:\s*(\d+)", message)
        if not chain_match or int(chain_match.group(1)) != 10:
            return False, None, "Invalid chain id"

        # Validate nonce
        nonce_match = re.search(r"Nonce:\s*(\S+)", message)
        if not nonce_match or nonce_match.group(1) != expected_nonce:
            return False, None, "Nonce mismatch"

        # Validate domain (if provided)
        if expected_domain:
            first_line = message.splitlines()[0]
            if expected_domain not in first_line:
                return False, None, "Domain mismatch"

        # Extract FID from resources: farcaster://fids/<fid>
        fid_match = re.search(r"farcaster://fids/(\d+)", message)
        if not fid_match:
            return False, None, "No FID in message"
        fid = int(fid_match.group(1))

        # Extract address from second line
        addr_match = re.search(r"0x[a-fA-F0-9]{40}", message)
        if not addr_match:
            return False, None, "No address in message"
        claimed_address = addr_match.group(0).lower()

        # Recover signer from signature using EIP-191
        encoded = encode_defunct(text=message)
        recovered = Account.recover_message(encoded, signature=signature)
        if recovered.lower() != claimed_address:
            return False, None, "Signature mismatch"

        return True, fid, None
    except Exception as e:
        return False, None, f"Verification error: {e}"
