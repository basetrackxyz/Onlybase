# OnlyBase Auth Testing Playbook

This app uses **unified JWT auth** (httpOnly access_token + refresh_token cookies) with 3 entry methods:

1. Email + password (register / login)
2. Emergent-managed Google OAuth
3. Sign In With Farcaster (SIWF)

All three produce identical JWT cookies and hit the same MongoDB `users` collection with `user_id` (uuid string, never `_id`).

## Endpoints

Base path: `{REACT_APP_BACKEND_URL}/api/auth`

- `POST /register` — body `{email, password, name?}` → returns user + sets cookies
- `POST /login` — body `{email, password}` → returns user + sets cookies
- `POST /logout` → clears cookies
- `GET /me` (authenticated) → returns user
- `POST /refresh` → rotates access token using refresh_token cookie
- `GET /nonce` → returns `{nonce}` used by SIWF
- `POST /google` — body `{session_id}` (from Emergent callback) → issues JWT cookies
- `POST /farcaster` — body `{fid, username, displayName, bio, pfpUrl, signature, message, nonce}` → verifies SIWF, issues JWT cookies
- `POST /farcaster/link` (authenticated) — same body, links to current user

## MongoDB

Database: `onlybase_db`, collection: `users`.
Unique partial indexes: `email`, `handle`, `google_id`, `farcaster_fid` (skip nulls).
Additional: `user_id` unique, `login_attempts.key` unique.

Check with mongosh:
```
mongosh
use onlybase_db
db.users.find({}, {_id:0, password_hash:0}).pretty()
db.users.getIndexes()
```
Admin doc should have role: "admin" and verified: true.

## curl smoke test

```
API=https://hey-talk-247.preview.emergentagent.com/api

# register
curl -s -c /tmp/c.txt -X POST "$API/auth/register" -H "Content-Type: application/json" \
  -d '{"email":"a@b.com","password":"secret123","name":"A"}'

# /me
curl -s -b /tmp/c.txt "$API/auth/me"

# login as admin
curl -s -c /tmp/c.txt -X POST "$API/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"admin@onlybase.app","password":"admin123"}'

# nonce (for Farcaster)
curl -s "$API/auth/nonce"

# logout
curl -s -b /tmp/c.txt -X POST "$API/auth/logout"
```

## Frontend testing notes

- Login page at `/login`
- Google button redirects to `https://auth.emergentagent.com/?redirect=<ORIGIN>/auth/callback`. On return with `#session_id=...` fragment, `AppRouter` picks it up in **render** (not useEffect) to avoid race conditions and calls `/api/auth/google`.
- Farcaster button (`FarcasterLoginButton.jsx`) uses `@farcaster/auth-kit`. It fetches a nonce from `/api/auth/nonce`, shows a QR code for Warpcast, and on success calls `/api/auth/farcaster`.
- Protected routes: `/feed`, `/discover`, `/swap`, `/messages`, `/profile`, `/creator/:id`, `/create`.
- Unauthenticated hits to protected routes redirect to `/login`.
- `AuthProvider` checks `/auth/me` on mount UNLESS the URL hash has `session_id=` (so `AuthCallback` can establish the session first).

## SIWF Testing

Full Warpcast mobile scan is required to produce a real signature. For curl-based tests only the nonce + signature verification path can be unit-tested; the `/api/auth/farcaster` endpoint rejects invalid signatures with a 401.

## Success Indicators
- `/api/auth/register` returns 200 with user object and sets cookies
- `/api/auth/me` returns 200 with user object when cookies present, 401 otherwise
- Duplicate email returns 409
- Wrong password returns 401
- 5 wrong password attempts return 429 locked for 15 min
