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
- `[ACTIVE]` Schedule builder day tabs with conflict detection logic
- `[DONE]` Avatar and AvatarGroup components shared across screens
- `[NEXT]` Group screen vote persistence (Firestore) and empty states
- `[DONE]` Settings screen saved festivals list and genre preferences form
- `[DONE]` Artist discovery tab with list and detail screens
- `[NEXT]` Optimistic loading states and skeletons for list and detail views

## Week 2.5 - Expo Go Internal Demo
- `[NEXT]` Prep Expo Go share build (documentation + QA checklist)
- `[NEXT]` Harden festival list search & filters for demo
- `[NEXT]` Add minimal profile read/edit view for demo
- `[NEXT]` Ensure schedule builder read-only preview works end-to-end
- `[NEXT]` QA navigation + theming consistency (tabs, status bar)
- `[LATER]` (Post-demo) layer in Firestore persistence for saved festivals
- `[-]` Exclude group chat/social features from demo scope

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
- `[DONE]` Restructure festival data into `data/festivals/*.json` and directory-driven seeding
- `[DONE]` Split artists into `data/artists` directory and seed dedicated collection
- `[NEXT]` Supply service account path or JSON via env (`FIREBASE_SERVICE_ACCOUNT_PATH`)
- `[NEXT]` Seed `festivals` collection and run validation spot checks
- `[NEXT]` Add seeder validation for missing `artistId` references and batched writes
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
- `[NEXT]` Clean mojibake in legacy diagrams (Festival card, schedule row)
- `[NEXT]` Add Figma links and export references in layout section
- `[DONE]` Document StyleSheet design system (colors, typography, spacing)
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
