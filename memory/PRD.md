# OnlyBase — Product Requirements

## Original Problem Statement
Build a mobile app like OnlyFans but for crypto (not adults). App name: **OnlyBase**. Posts are FREE to view for everyone. Creators pay the platform a subscription to get a blue verified checkmark (Twitter-style scalloped badge) and unlock monetization. Messaging creators requires paying that creator's subscription price. In-app wallet with send/receive, swap, and trade for any token on the Base network. NSFW content = permanent account ban with no recovery.

## Architecture
- **Frontend**: React 19 + React Router 7, Tailwind CSS, Phosphor Icons, Outfit (display) + Manrope (body) Google Fonts
- **Backend**: FastAPI + MongoDB (currently scaffolded only, boilerplate `/api/` endpoints)
- **Design System**: Swiss high-contrast light theme (Coinbase-polished). Base blue (#0052FF) reserved for verification badges and primary CTAs. Black primary buttons. Mobile-first container (max-w-md) centered on desktop.

## User Personas
1. **Fan** — browses free posts, follows creators, subscribes to individual creators for private DMs, swaps tokens in-app, tips creators
2. **Creator** — pays platform subscription to become verified, posts content, sets their own DM price, receives tips onchain
3. **Trader** — primarily uses the Swap tab to trade Base tokens, discovers alpha creators

## Core Requirements
- Twitter-style scalloped blue verification badge (Phosphor `SealCheck` filled, #0052FF)
- Public & free feed (no paywall on posts)
- Paid DMs (per-creator subscription pricing set by the creator)
- Platform subscription fee for verification (~9.99 USDC/month suggested)
- In-app Base network wallet (send, receive, swap, scan)
- Token swap supporting any token on Base
- Hard-enforced no-NSFW policy with permanent bans
- Mobile-first responsive web experience

## What's Been Implemented (Jan 2026)
### Session 1 — Design & Frontend Scaffolding (Mocked Data)
- ✅ Full mobile-first UI (max-w-md container w/ shadow) across all core screens
- ✅ Design system: Outfit + Manrope fonts, Base blue accent, Swiss layout, Phosphor icons
- ✅ **Onboarding** screen with OnlyBase wordmark, feature rail, dual CTA (Get started / Connect wallet)
- ✅ **Feed** (`/feed`) — sticky header with create/notifications, "For you / Following / Base" tabs, horizontal stories of verified creators, scrollable posts with like/comment/tip/share
- ✅ **Discover** (`/discover`) — search, category chips (All, Trading, DeFi, NFT, Education, Alpha, News), trending-this-week rail with banner cards, creator list with Follow CTAs
- ✅ **Swap / Wallet** (`/swap`) — black premium wallet card (Base Mainnet badge + address), 4-action shortcut (Send/Receive/Swap/Scan), tab switcher (Swap / Tokens / Activity), clean swap interface with token selectors, details rows (rate, slippage, route), token list with 24h change, transaction activity
- ✅ **Messages** (`/messages`) — locked/unlocked conversation cards, lock badges + per-creator subscription price, subscribed vs unsubscribed visual states, unread counters
- ✅ **Profile** (`/profile`) — avatar, bio, wallet shortcut card, stats (posts/following/followers), "Become a verified creator" monetization card, modal for verification flow
- ✅ **Creator Profile** (`/creator/:id`) — banner, overlapping avatar, verified badge, follow + tip buttons, "Subscribe to message $X/mo" CTA, tabs (Posts / Media grid / About), subscription modal with onchain breakdown
- ✅ **Create Post** (`/create`) — textarea, photo/video/tag toolbar, prominent NSFW policy warning
- ✅ Bottom navigation (Home, Discover, Swap, Messages, Profile) with glass-morphism
- ✅ Mock data (creators, posts, tokens ETH/USDC/cbBTC/AERO/DEGEN/BRETT/HIGHER/MOXIE, transactions, conversations)
- ✅ All interactive elements have data-testid attributes

**Status: ALL FLOWS ARE FRONTEND-ONLY WITH MOCKED DATA. No backend routes implemented yet.**

## Prioritized Backlog

### P0 — Must-have to be a functional product
- [ ] Authentication (Emergent Google OAuth or JWT) + user model in MongoDB
- [ ] Creator verification payment flow (USDC on Base) + onchain receipt
- [ ] Post CRUD (create, list, like, comment, delete) with real DB persistence
- [ ] Content moderation pipeline (NSFW image classifier → auto-ban)
- [ ] Per-creator DM subscription purchase + unlock gating
- [ ] Real-time messaging (WebSocket) for subscribed conversations
- [ ] Base wallet connect (Coinbase Smart Wallet / WalletConnect)

### P1 — Important
- [ ] Actual token swap integration (Aerodrome / 0x / Uniswap on Base)
- [ ] Tipping flow (onchain USDC transfer with creator wallet address)
- [ ] Media upload (images/video) to cloud storage (S3 / Cloudinary)
- [ ] Follow / follower system
- [ ] Notifications (in-app + push)
- [ ] Search (creators, tags, posts)

### P2 — Nice to have
- [ ] Referral / affiliate program for creators
- [ ] Creator analytics dashboard
- [ ] Live streaming / live audio rooms
- [ ] Leaderboards (top earners, trending tokens)
- [ ] iOS/Android native build (React Native) or PWA install

## Next Actions
1. Review the design with the user — gather feedback on screens, colors, copy
2. If approved → begin P0 backend work: auth first, then post model + verification flow
3. Integrate Base wallet (Coinbase Smart Wallet SDK)
4. Testing agent validation after each major feature
