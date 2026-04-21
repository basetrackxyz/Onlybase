# OnlyBase — Product Requirements

## Original Problem Statement
Build a mobile app like OnlyFans but for crypto (not adults). App name: **OnlyBase**. Posts are FREE to view for everyone. Creators pay the platform a subscription to get a blue verified checkmark (Twitter-style scalloped badge) and unlock monetization. Messaging creators requires paying that creator's subscription price. In-app wallet with send/receive, swap, and trade for any token on the Base network. NSFW content = permanent account ban with no recovery.

## Architecture
- **Frontend**: React 19 + React Router 7, Tailwind CSS (darkMode: class), Phosphor Icons, Outfit + Manrope Google Fonts
- **Backend**: FastAPI + MongoDB (scaffold only)
- **Theme**: Light (Swiss high-contrast) + Dark (OLED-ready pure black). Persisted via localStorage.

## Core Requirements
- Twitter-style scalloped blue verification badge (Phosphor SealCheck filled, #0052FF)
- Public & free feed (no paywall on posts)
- Paid DMs per creator (creator sets price)
- Platform verification fee (~9.99 USDC/mo) for blue badge
- In-app Base network wallet
- Token swap on Base
- Hard no-NSFW policy with permanent bans
- Mobile-first responsive web experience
- Light + Dark mode toggle

## Implemented (Jan 2026)

### Session 1 — Design scaffolding with mock data
- Full mobile-first UI across all 8 screens (Onboarding, Feed, Discover, Swap/Wallet, Messages, Profile, Creator Profile, Create Post)
- Typography: Outfit + Manrope, Base blue accent only on verified badges and primary CTAs
- Bottom navigation with 5 tabs
- All interactive elements have data-testid

### Session 2 — Dark mode
- ThemeContext + useTheme hook with localStorage persistence
- ThemeToggle component (sun/moon icon)
- Toggle visible in every screen header + onboarding top-right
- All 8 screens updated with Tailwind `dark:` variants
- Pure black (#000) app background, #0A0A0A mobile container in dark mode
- Wallet card and modals also respect dark mode with proper border/ring treatment

**Status: FRONTEND-ONLY. All data mocked. No backend yet.**

## Prioritized Backlog (P0 awaiting user decisions)
- Authentication (Emergent Google / JWT / both) — pending user choice
- Base wallet connect (Coinbase Smart Wallet / WalletConnect / mocked) — pending user choice
- NSFW moderation provider (Sightengine / AWS Rekognition / hive.ai / manual reports) — pending user choice
- Media storage (Cloudinary / S3 / text-only for MVP) — pending user choice
- Verification payment flow (simulated / real USDC on Base / Stripe fiat) — pending user choice
- Real-time messaging (WebSocket) for subscribed conversations
- Post CRUD with real DB persistence
- Tipping flow onchain

## P1
- Aerodrome/0x integration for real token swap (deferred per user)
- Follow/follower system
- Notifications
- Search

## P2
- Creator referral split
- Analytics dashboard
- Live streaming / audio rooms
- Leaderboards
- PWA / native build

## Next Actions
1. **User to pick options** for auth, wallet, NSFW moderation, media storage, payment flow
2. Begin P0 backend once decisions are made
