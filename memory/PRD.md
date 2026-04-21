# OnlyBase — Product Requirements

## Original Problem Statement
Crypto creator platform on Base (mobile-first web app). App name: OnlyBase. Blue Twitter-style verified badge. Free public posts, paid DMs per creator, in-app Base wallet with swap. Hard no-NSFW policy with permanent ban. Creators pay $4 USDC/mo or $40/year for verification.

## Architecture
- Frontend: React 19 + React Router 7, Tailwind (darkMode:class), Phosphor Icons, Outfit + Manrope, @farcaster/auth-kit, viem
- Backend: FastAPI + motor/MongoDB (db: `onlybase_db`)
- Auth: JWT httpOnly cookies (access 15m, refresh 7d), bcrypt hashing, partial unique indexes
- Theme: Light + Dark mode with localStorage persistence

## User Choices Made
1. **Auth**: Email+password (JWT) + Emergent Google + Farcaster SIWF — unified into one users collection
2. **Wallet**: Coinbase Smart Wallet (in-app, passkey UX) — pending next phase
3. **NSFW**: Sightengine — pending next phase
4. **Media**: Cloudinary — pending next phase
5. **Payment**: Real USDC on Base ($4/mo or $40/year) — pending next phase

## Implemented (Jan 2026)

### Session 1 — Design scaffolding (mock data)
- 8 screens: Onboarding, Feed, Discover, Swap/Wallet, Messages, Profile, Creator Profile, Create Post
- Mobile container, bottom nav, sticky headers, stories rail
- Twitter-style scalloped blue verified badge (Phosphor SealCheck)

### Session 2 — Dark mode
- ThemeContext + localStorage persistence
- ThemeToggle in every screen header
- All 8 screens updated with Tailwind `dark:` variants

### Session 3 — Unified authentication (Phase 1 P0)
- **Backend** (`/app/backend/`):
  - `auth.py`: bcrypt hashing, JWT create/verify, set/clear cookies, get_current_user, ensure_unique_handle, fetch_emergent_session, verify_siwf_signature (SIWE + EIP-191)
  - `server.py`: `/api/auth/{register,login,logout,me,refresh,nonce,google,farcaster,farcaster/link}` endpoints
  - Startup: partial unique indexes on email/handle/google_id/farcaster_fid (excludes nulls); admin seed (admin@onlybase.app / admin123)
  - Brute-force lockout (5 attempts → 15 min) keyed by X-Forwarded-For (works behind k8s ingress)
  - UserPublic model with role, auth_methods, farcaster_fid
- **Frontend** (`/app/frontend/src/`):
  - `context/AuthContext.jsx` + `context/ThemeContext.jsx`
  - `lib/api.js` (axios w/ withCredentials)
  - `pages/LoginPage.jsx` — login/register toggle + Google + Farcaster
  - `pages/AuthCallback.jsx` — processes Emergent `#session_id=` in render
  - `components/FarcasterLoginButton.jsx` — AuthKitProvider + SignInButton (fetches nonce from backend, relabeled "Continue with Farcaster")
  - `components/ProtectedRoute.jsx` — loading → redirect to /login
  - `App.js` — AppRouter processes session_id in render before Routes to avoid race conditions
  - `ProfilePage.jsx` — uses real user data + auth_methods chips + Sign out button
- **Credentials**: Saved to `/app/memory/test_credentials.md`
- **Testing**: `/app/auth_testing.md` playbook saved

### Tested & Working
- Register, login, /me, logout, refresh, nonce, google(401 for invalid), farcaster(401 for invalid), duplicate email (409), wrong password (401), brute-force lockout (429 on 6th attempt after fix), admin seed, protected routes redirect to /login when unauthenticated, full UI flow

**Status: Auth fully operational. All feed/swap/messaging data still MOCKED pending next phases.**

## Backlog

### Next Phase — P0 remaining
- Coinbase Smart Wallet integration (in-app wallet)
- Post CRUD (create, list, like, comment) with DB
- Cloudinary media upload
- Sightengine NSFW moderation on post create → auto-ban
- Creator verification flow ($4/mo or $40/yr USDC on Base)
- DM subscription purchase + conversation unlock
- Real-time messaging (WebSocket)

### P1
- Aerodrome/0x swap integration (deferred per user)
- Tipping onchain
- Follow/follower system
- Notifications
- Search

### P2
- Creator referral split (10% onchain)
- Analytics dashboard
- Live streaming

## Known non-critical notes
- Cookie flags hard-coded `secure=True, samesite="none"` (fine for HTTPS preview, may need env-driven flag for local HTTP dev)
- AuthContext swallows network errors as "not authenticated" — can be differentiated later
