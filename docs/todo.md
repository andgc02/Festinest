# Festinest TODOs (Oct 2025)

Status legend (use one marker per task):
- `[DONE]` work is complete and merged
- `[ACTIVE]` currently in flight
- `[NEXT]` queued for the current cycle
- `[BLOCKED]` waiting on a dependency or decision

## Week 1 - Foundations (shipped)
- `[DONE]` Expo Router layout with login gating
- `[DONE]` Firebase auth integration with persistence helpers   
- `[DONE]` NativeWind baseline with shared Tailwind tokens
- `[DONE]` Base UI primitives (Button, Input, SearchBar, Card)
- `[DONE]` FilterChip, Tabs, Modal, Toast components
- `[DONE]` Typography utilities and theme tokens in `constants/theme.ts`
- `[DONE]` Festival list filters wired to seeded data

## Week 2 - Core Screens
- `[ACTIVE]` Festival detail lineup accordion plus save CTA wiring
- `[ACTIVE]` Schedule builder day tabs with conflict detection logic
- `[NEXT]` Avatar and AvatarGroup components shared across screens
- `[NEXT]` Group screen vote persistence (Firestore) and empty states
- `[NEXT]` Settings screen saved festivals list and genre preferences form
- `[NEXT]` Optimistic loading states and skeletons for list and detail views

## Week 3 - Social Features
- `[NEXT]` Firestore group schema (members, votes, chat preview)
- `[NEXT]` Real-time schedule voting integration
- `[NEXT]` QR invite modal using `react-native-qrcode-svg`
- `[NEXT]` Notification preferences plumbing (Expo push)
- `[NEXT]` Group chat placeholder promoted to Firestore-backed preview
- `[BLOCKED]` Moderation policy for group chat (product decision)

## Week 4 - Auth and Settings
- `[NEXT]` Profile edit flow (name, avatar upload, genre preferences)
- `[NEXT]` Saved festivals syncing (user collection and favorites subcollection)
- `[NEXT]` Password reset and social auth entry points
- `[NEXT]` Onboarding wizard with premium upsell CTA
- `[NEXT]` Settings privacy and data export options

## Data and Seeding
- `[DONE]` Curated `data/festivals.json`
- `[DONE]` `tools/seedFestivals.js` Firestore seeder
- `[NEXT]` Supply service account path or JSON via env (`FIREBASE_SERVICE_ACCOUNT_PATH`)
- `[NEXT]` Seed `festivals` collection and run validation spot checks
- `[NEXT]` Monthly update workflow and staging collection documentation
- `[NEXT]` Expand source list (MusicFestivalWizard, Festival Survival Guide, JamBase, EDMTrain) with attribution notes
- `[BLOCKED]` Automated seeding via GitHub workflow (secrets management decision)

## QA, Tooling, Dev Experience
- `[NEXT]` Storybook or Expo Router sandbox for UI components
- `[NEXT]` Unit tests for services (`fetchFestivals`, schedule transforms)
- `[NEXT]` Detox smoke test for login to list to detail happy path
- `[NEXT]` ESLint and TypeScript strict rule tune-up (enable `no-floating-promises`, etc.)
- `[NEXT]` Pre-commit hook for formatting (lint-staged plus Prettier)
- `[BLOCKED]` Mobile CI (EAS) setup pending project owner sign-off

## Documentation and Enablement
- `[DONE]` Roadmap refreshed with full status breakdown
- `[DONE]` README covers seeding instructions and local env
- `[NEXT]` Clean mojibake in legacy diagrams (Festival card, schedule row)
- `[NEXT]` Add Figma links and export references in layout section
- `[NEXT]` Document theming and typography tokens for contributors
- `[NEXT]` Write onboarding guide for new engineers (auth, data, env)
- `[NEXT]` Draft release checklist (QA sign-off, seeding, analytics verification)

## Analytics and Growth
- `[NEXT]` Define core analytics events (signup, save festival, vote)
- `[NEXT]` Configure Segment or Expo analytics shim
- `[NEXT]` Landing page A/B testing hooks (stretch goal)
- `[BLOCKED]` Marketing attribution plan (await brand and marketing brief)

## Backlog and Stretch Goals
- `[NEXT]` Offline caching mode for festival data
- `[NEXT]` Recommendations engine (genre plus friend overlap)
- `[NEXT]` Premium upsell page with paywall experiment
- `[NEXT]` Apple Wallet or Google Wallet pass generation for tickets
- `[NEXT]` Marketplace exploration (merch, bundles)
- `[BLOCKED]` Partnerships API integration (depends on external access)
