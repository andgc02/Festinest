# Festinest TODOs (Oct 2025)

Status legend (use one marker per task):
- `[DONE]` work is complete and merged
- `[ACTIVE]` currently in flight
- `[NEXT]` queued for the current cycle
- `[BLOCKED]` waiting on a dependency or decision

## Week 1 - Foundations (shipped)
- `[DONE]` Expo Router layout with login gating
- `[DONE]` Firebase auth integration with persistence helpers   
- `[DONE]` StyleSheet design system scaffolding (replaced NativeWind/Tailwind)
- `[DONE]` Base UI primitives (Button, Input, SearchBar, Card)
- `[DONE]` FilterChip, Tabs, Modal, Toast components
- `[DONE]` Typography utilities and theme tokens in `constants/theme.ts`
- `[DONE]` Festival list filters wired to seeded data

## Week 2 - Core Screens
- `[DONE]` Light theme polish + entrance animations (Festival list, chips, Group, Schedule)
- `[DONE]` Festival detail lineup accordion plus save CTA wiring
- `[DONE]` Saved festivals state management shared across screens
- `[DONE]` Schedule builder day tabs with conflict detection logic + layout normalization
- `[DONE]` Avatar and AvatarGroup components shared across screens
- `[DONE]` Group screen vote persistence (Firestore) and empty states
- `[DONE]` Settings screen saved festivals list and genre preferences form
- `[DONE]` Artist discovery tab with list and detail screens
- `[DONE]` Lineup and schedule cards surface artist genres and socials
- `[DONE]` Optimistic loading states and skeletons for list and detail views
- `[DONE]` Group detail delete & leave controls for owner and members

## Premium Foundations Track
- `[ARCHIVED]` Prep Expo Go share build (documentation + QA checklist)
- `[DONE]` Harden festival list search & filters (tokenized search, richer defaults)
- `[DONE]` Local-only profile edit screen (placeholder until Firestore sync)
- `[NEXT]` Schedule builder preview mode (non-editable view, ahead of share links)
- `[NEXT]` QA navigation + theming consistency (tabs, status bar, safe areas)
- `[DONE]` Saved festivals persistence in Firestore (promote from local only)

## Week 3 - Social Features
- `[NEXT]` Firestore group schema (members, votes, chat preview)
- `[NEXT]` Real-time schedule voting integration
- `[NEXT]` QR invite modal using `react-native-qrcode-svg`
- `[NEXT]` Notification preferences plumbing (Expo push)
- `[NEXT]` Group chat placeholder promoted to Firestore-backed preview
- `[NEXT]` Lightning polls quick win for premium plan (swipe decisions)
- `[NEXT]` Group leader controls (nudge, lock, highlight) gated behind premium
- `[BLOCKED]` Moderation policy for group chat (product decision)

## Week 4 - Auth and Settings
- `[NEXT]` Profile edit flow (name, avatar upload, genre preferences)
- `[NEXT]` Saved festivals syncing (user collection and favorites subcollection)
- `[NEXT]` Password reset and social auth entry points
- `[NEXT]` Onboarding wizard with premium upsell CTA
- `[NEXT]` Settings privacy and data export options
- `[NEXT]` Festival companion mode (lite) surfaced for premium users
- `[NEXT]` Custom festival nicknames flowing through badges, recaps, lists
- `[LATER]` Smart walk-time buffer and arrival warnings (premium)
- `[LATER]` Festival archetype cards with seasonal refresh

## Data and Seeding
- `[DONE]` Curated `data/festivals.json`
- `[DONE]` `tools/seedFestivals.js` Firestore seeder
- `[DONE]` Restructure festival data into `data/festivals/*.json` and directory-driven seeding
- `[DONE]` Split artists into `data/artists` directory and seed dedicated collection
- `[DONE]` Normalize Coachella 2026 lineup to reference artistIds
- `[NEXT]` Supply service account path or JSON via env (`FIREBASE_SERVICE_ACCOUNT_PATH`)
- `[NEXT]` Seed `festivals` collection and run validation spot checks
- `[DONE]` Add seeder validation for missing `artistId` references and batched writes
- `[ACTIVE]` Seed `festivalAttendees` aggregates from `data/attendance/*.json`
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
- `[DONE]` Data model doc outlining artists/festivals schema
- `[DONE]` Premium feature catalog + differentiators doc
- `[NEXT]` Clean mojibake in legacy diagrams (Festival card, schedule row)
- `[NEXT]` Add Figma links and export references in layout section
- `[DONE]` Document StyleSheet design system (colors, typography, spacing)
- `[NEXT]` Write onboarding guide for new engineers (auth, data, env)
- `[NEXT]` Draft release checklist (QA sign-off, seeding, analytics verification)
- `[NEXT]` Document premium paywall and entitlement flow in README supplement

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
- `[LATER]` Artist streak tracker insights for premium recap
- `[LATER]` Daily recap generator and shareable premium cards
- `[LATER]` Live set tracker instrumentation for premium history
