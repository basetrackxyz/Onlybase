"""Backend test suite for OnlyBase Auth APIs (Phase 1)."""
import os
import uuid
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://hey-talk-247.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@onlybase.app"
ADMIN_PASSWORD = "admin123"


def _new_email():
    return f"test_{uuid.uuid4().hex[:10]}@onlybase.app"


# ---------- Basics ----------
class TestRoot:
    def test_root(self):
        r = requests.get(f"{API}/")
        assert r.status_code == 200
        body = r.json()
        assert body.get("message") == "OnlyBase API"


# ---------- Nonce ----------
class TestNonce:
    def test_nonce_returns_random_hex(self):
        r1 = requests.get(f"{API}/auth/nonce")
        r2 = requests.get(f"{API}/auth/nonce")
        assert r1.status_code == 200
        assert r2.status_code == 200
        n1 = r1.json()["nonce"]
        n2 = r2.json()["nonce"]
        assert isinstance(n1, str) and len(n1) >= 16
        assert n1 != n2  # randomness


# ---------- Register / Login / Me / Logout / Refresh ----------
class TestEmailAuth:
    def test_register_login_me_logout_refresh(self):
        s = requests.Session()
        email = _new_email()
        # register
        r = s.post(f"{API}/auth/register", json={"email": email, "password": "secret123", "name": "Tester"})
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["email"] == email
        assert body["handle"]
        assert "user_id" in body
        assert "auth_methods" in body and "email" in body["auth_methods"]
        # cookies set
        assert "access_token" in s.cookies
        assert "refresh_token" in s.cookies

        # /me
        r = s.get(f"{API}/auth/me")
        assert r.status_code == 200
        assert r.json()["email"] == email

        # refresh
        r = s.post(f"{API}/auth/refresh")
        assert r.status_code == 200
        assert r.json().get("ok") is True
        assert "access_token" in s.cookies

        # logout
        r = s.post(f"{API}/auth/logout")
        assert r.status_code == 200
        # After logout, /me without cookies should 401
        s2 = requests.Session()
        r = s2.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_unauth(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_duplicate_email_returns_409(self):
        s = requests.Session()
        email = _new_email()
        r = s.post(f"{API}/auth/register", json={"email": email, "password": "secret123"})
        assert r.status_code == 200
        # try again
        r = s.post(f"{API}/auth/register", json={"email": email, "password": "secret123"})
        assert r.status_code == 409

    def test_login_admin_seeded(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["email"] == ADMIN_EMAIL
        assert body.get("verified") is True
        # role isn't part of UserPublic, so verify via DB? Just check verified for admin signal
        assert "access_token" in s.cookies

    def test_wrong_password_returns_401(self):
        # Use a fresh email so we don't trip lockout for admin
        s = requests.Session()
        email = _new_email()
        s.post(f"{API}/auth/register", json={"email": email, "password": "secret123"})
        # logout to get clean session
        s.post(f"{API}/auth/logout")
        r = requests.post(f"{API}/auth/login", json={"email": email, "password": "wrongpass"})
        assert r.status_code == 401

    def test_refresh_without_token_401(self):
        r = requests.post(f"{API}/auth/refresh")
        assert r.status_code == 401


# ---------- Google ----------
class TestGoogleAuth:
    def test_google_invalid_session_returns_401(self):
        r = requests.post(f"{API}/auth/google", json={"session_id": "definitely-not-a-real-session-" + uuid.uuid4().hex})
        assert r.status_code == 401


# ---------- Farcaster ----------
class TestFarcasterAuth:
    def test_farcaster_invalid_signature_returns_401(self):
        # Get a real nonce
        nonce = requests.get(f"{API}/auth/nonce").json()["nonce"]
        # Build a plausible-looking SIWF message but with bogus signature
        message = (
            "hey-talk-247.preview.emergentagent.com wants you to sign in with your Ethereum account:\n"
            "0x0000000000000000000000000000000000000000\n\n"
            "Farcaster Auth\n\n"
            "URI: https://hey-talk-247.preview.emergentagent.com\n"
            "Version: 1\n"
            f"Chain ID: 10\n"
            f"Nonce: {nonce}\n"
            "Issued At: 2026-01-01T00:00:00Z\n"
            "Resources:\n- farcaster://fids/12345"
        )
        bogus_sig = "0x" + "00" * 65
        r = requests.post(f"{API}/auth/farcaster", json={
            "fid": 12345, "username": "test", "displayName": "T", "bio": "",
            "pfpUrl": None, "signature": bogus_sig, "message": message, "nonce": nonce
        })
        assert r.status_code == 401

    def test_farcaster_link_requires_auth(self):
        nonce = requests.get(f"{API}/auth/nonce").json()["nonce"]
        r = requests.post(f"{API}/auth/farcaster/link", json={
            "fid": 1, "signature": "0x" + "00" * 65, "message": "x", "nonce": nonce
        })
        assert r.status_code == 401


# ---------- Brute-force lockout ----------
class TestBruteForce:
    def test_lockout_after_5_attempts(self):
        s = requests.Session()
        email = _new_email()
        s.post(f"{API}/auth/register", json={"email": email, "password": "secret123"})
        s.post(f"{API}/auth/logout")
        # 5 wrong attempts
        for _ in range(5):
            r = requests.post(f"{API}/auth/login", json={"email": email, "password": "wrong"})
            assert r.status_code == 401
        # 6th should be locked (429)
        r = requests.post(f"{API}/auth/login", json={"email": email, "password": "wrong"})
        assert r.status_code == 429
