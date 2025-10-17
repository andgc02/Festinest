# Festinest Product Roadmap (Updated Oct 2025)

Status legend:
- `[DONE]` delivered and merged
- `[ACTIVE]` currently in flight
- `[NEXT]` planned for the current cycle
- `[LATER]` post-MVP stretch
- `[BLOCKED]` waiting on an external decision or dependency

## Snapshot Summary
- `[DONE]` Week 1 foundation work (routing, auth, theming, core components)
- `[ACTIVE]` Week 2 feature polish across Festival Detail, Schedule Builder, and Group
- `[NEXT]` Week 2.5 Expo Go demo readiness (internal shareable build)
- `[NEXT]` Social collaboration (votes, invites) plus auth/settings depth for Weeks 3-4
- `[LATER]` Analytics, growth, premium upsell, offline support, partnerships

## Completed to Date
- `[DONE]` Expo Router stack with login gating (`apps/mobile/app/_layout.tsx` and tabs layout)
- `[DONE]` Firebase Auth integration with persistent sessions and admin seeding script
- `[DONE]` StyleSheet-based design system (colors/typography/spacing) replacing NativeWind
- `[DONE]` Base UI primitives (Button, Input, SearchBar, Card) and supporting utilities
- `[DONE]` Week 1 UI polish: FilterChip, Tabs, Modal, Toast, typography utilities
- `[DONE]` Festival list, detail, and schedule builder placeholders wired to seed data
- `[DONE]` Light theme polish with entrance animations (Festival list, Group, Schedule, chips)
- `[DONE]` Saved festivals persistence (AsyncStorage provider) and detail CTA toggle
- `[DONE]` Artists discovery tab with list and detail experiences
- `[DONE]` Settings screen logout flow and docs directory setup

## In Flight (Week 2 Focus)
- `[DONE]` Festival detail lineup accordion and saved festivals CTA wiring
- `[ACTIVE]` Schedule builder day tabs plus conflict detection research
- `[ACTIVE]` Group screen revamp (votes preview, chat summary, invite modal)
- `[DONE]` Theming cleanup on legacy screens using StyleSheet tokens; remove remaining mojibake
- `[DONE]` Avatar and AvatarGroup components for profile and group views
- `[DONE]` Saved festivals state management shared across tabs

## Roadmap by Theme

### Core MVP Screens
| Screen | Status | Next Actions | Notes |
| --- | --- | --- | --- |
| Festival List | `[ACTIVE]` | Debounce search, extend filter logic, add loading skeletons | Entrance animation + light theme pass done |
| Festival Detail | `[ACTIVE]` | Persist saved festivals to Firestore, add travel tips block | Local persistence + accordion shipped |
| Artists | `[DONE]` | Layer in previews, follow actions, and Firestore sync | Discovery list + detail screen live |
| Schedule Builder | `[NEXT]` | Conflict detection, Firestore persistence, sharing workflow | Tabs component powers day switching |
| Group | `[ACTIVE]` | Persist votes and chat, integrate invite QR | UI polished with animated rows + light surfaces |
| Settings | `[ACTIVE]` | Profile edit flow and premium toggle prep (saved list + genre prefs shipped) | Prepare for premium toggle |
| Login/Onboarding | `[NEXT]` | Social auth entry points, copy and logging polish | Demo credentials prefilled |

### Reusable Component Library
- `[DONE]` Button, Input, SearchBar, Card, FilterChip, Tabs, Modal, Toast
- `[NEXT]` Avatar, AvatarGroup, Toggle, ToastProvider, modal wizard pattern
- `[NEXT]` Empty state illustrations and copy guidelines
- `[LATER]` Schedule heat map or timeline visual components

### Navigation and Auth
- `[DONE]` Auth guarding on router tabs
- `[NEXT]` Expo Router typed routes and manifest documentation
- `[NEXT]` Authentication guard hooks (redirect unauthenticated users to `/login`)
- `[LATER]` Deep link support for invites and saved festivals

### Theming and Design System
- `[DONE]` Central StyleSheet tokens in `apps/mobile/styles/*` and `constants/theme.ts`
- `[DONE]` Apply typography tokens across legacy screens and providers
- `[NEXT]` Light theme passes; define palettes per component
- `[NEXT]` Align Figma tokens (spacing, radii, gradients) with implementation
- `[LATER]` Theme switcher surfaced in Settings

### Data and Seeding
- `[DONE]` Curated `data/festivals.json` and seeding script
- `[DONE]` Split festival JSON into per-festival files (`data/festivals/*`) and directory-driven seeder
- `[DONE]` Stand up `artists` collection (`data/artists/*`) and reference `lineup[].artistId`
- `[DONE]` Normalize Coachella 2026 lineup JSON to use artist references
- `[DONE]` Seeder validation for missing artist references + batched writes
- `[ACTIVE]` Seed festival attendee aggregates (`data/attendance/*` → `festivalAttendees`)
- `[NEXT]` Secure service account injection (`FIREBASE_SERVICE_ACCOUNT_PATH`)
- `[NEXT]` Seed production collections and add validation checklist
- `[NEXT]` Monthly update SOP (staging collection, review, promote)
- `[BLOCKED]` Automated seeding pipeline (GitHub workflow pending secrets plan)
- `[LATER]` Additional datasets (artists, vendors, travel guides)

### Collaboration and Social
- `[NEXT]` Firestore group schema (members, votes, chat preview content)
- `[NEXT]` Real-time vote tally broadcast to all group members
- `[NEXT]` QR invite modal with `react-native-qrcode-svg` and share sheet
- `[LATER]` Full chat experience (push notifications, unread state)
- `[BLOCKED]` Moderation policy with product and operations

### Auth and Settings Expansion (Week 4)
- `[NEXT]` Profile edit flow (name, avatar upload, genre preferences)
- `[NEXT]` Saved festivals list tied to Firestore favorites collection
- `[NEXT]` Password reset plus Google/Apple sign-in entry points
- `[NEXT]` Onboarding wizard culminating in premium upsell CTA
- `[LATER]` Privacy controls (data export, delete account workflow)

### Analytics and Growth
- `[NEXT]` Define analytics events (auth, discovery, save festival, vote)
- `[NEXT]` Implement Segment or Expo analytics shim with dev logging
- `[LATER]` Landing page A/B tests, referral tracking, premium funnel metrics
- `[BLOCKED]` Marketing attribution tooling (await marketing plan)

### Documentation and Enablement
- `[DONE]` README and roadmap refresh with current sprint detail
- `[ACTIVE]` Remove mojibake from diagrams and legacy notes
- `[NEXT]` Link Figma files or image exports in layout references
- `[NEXT]` Contributor guide (dev setup, auth, data flows)
- `[NEXT]` Release checklist (QA sign-off, seeding, analytics verification)
- `[LATER]` Customer support playbook (FAQ, issue triage)

### Week 2.5 – Expo Go Internal Demo
- Goal: deliver a sharable Expo Go experience with core flows functioning.
- Requirements:
  - Festival list with working search/filters (Week 2 polish).
  - Festival detail with save toggle (local persistence complete; Firestore sync optional).
  - Auth (email/password) working end-to-end; logout tested.
  - Basic profile read/edit surface (minimal viable screen).
  - Schedule builder accessible with read-only preview.
  - Navigation polish: consistent tabs, safe areas, light theme.
  - Saved festivals accessible (local storage today, Firestore later in Week 4).
  - Exclude group chat/social features until post-demo.

### QA, Tooling, Dev Experience
- `[NEXT]` Storybook or Expo sandbox for rapid component QA
- `[NEXT]` Unit tests for data services (`fetchFestivals`, schedule transforms)
- `[NEXT]` Detox smoke test (login -> list -> detail -> schedule)
- `[NEXT]` ESLint and TypeScript strict-mode adoption (`no-floating-promises`, etc.)
- `[NEXT]` Pre-commit automation (lint-staged plus formatting)
- `[BLOCKED]` Mobile CI (EAS) pending account provisioning
- `[LATER]` Visual regression snapshots for critical flows

### Enhancements and Stretch
- `[LATER]` Offline caching for festival data and user schedules
- `[LATER]` Recommendations engine (genre affinity plus group overlap)
- `[LATER]` Premium upsell screen, paywall experiment, billing integration
- `[LATER]` Apple Wallet or Google Wallet pass export
- `[LATER]` Marketplace or vendor partnerships exploration

## Timeline at a Glance
- **Week 1 (complete):** foundation scaffolding, auth, theming, base components
- **Week 2 (in flight):** screen polish, state management, avatars, save flows
- **Week 2.5 (up next):** Expo Go internal demo (stabilize core flows, share QR)
- **Week 3 (next):** collaboration feature set (votes, chat preview, invites, notifications)
- **Week 4 (next):** deep auth/settings, onboarding, premium preview, QA automation
- **Post-MVP:** analytics and growth, offline/premium features, partnership experiments

## Recommended Cleanups and Follow-ups
1. `[NEXT]` Sweep for remaining mojibake characters across docs and code comments
2. `[NEXT]` Align README, roadmap, and todo status markers (reuse legend)
3. `[NEXT]` Add Figma links or static exports for key layouts (Festival Card, Schedule Row, Group Bubble, AvatarGroup)
4. `[NEXT]` Draft a `scripts/validateFestivals.ts` utility to flag missing `artistId` references and blank stage/day slots
5. `[NEXT]` Add a shared `FestivalType` interface used by app and seeder
6. `[BLOCKED]` Decide on secrets management before enabling CI seeding
7. `[LATER]` Prepare marketing brief (value prop, launch timeline, KPI targets)

## Appendix: Key References
- Components: `apps/mobile/components/ui`
- Theming: `apps/mobile/styles/*`, `apps/mobile/constants/theme.ts`
- Data seeding: `data/festivals/*`, `data/artists/*`, `tools/seedFestivals.js`
- Auth provider: `apps/mobile/providers/AuthProvider.tsx`
- Screens to revisit during polish: FestivalDetail, ScheduleBuilder, Group, Settings
