# Festinest TODOs (Oct 2025)

## Week 1 � Foundations
- [x] Expo Router layout with login gating
- [x] Firebase auth integration + persistence
- [x] NativeWind setup with Tailwind tokens
- [x] Base UI primitives (Button, Input, Card, SearchBar)
- [ ] Create FilterChip, Tabs, Toast, Modal components
- [ ] Define typography utility classes and apply to all screens
- [ ] Document theming tokens in constants/theme.ts

## Week 2 � Core Screens
- [ ] Replace mock FestivalList filters with real interactions
- [ ] Implement lineup expand/collapse in FestivalDetail
- [ ] Add conflict detection + persistence to ScheduleBuilder
- [ ] Build Avatar/AvatarGroup, integrate into Group screen

## Week 3 � Social Features
- [ ] Firestore group schema + shared schedule votes
- [ ] Build lightweight group chat preview
- [ ] QR invite modal (react-native-qrcode-svg)
- [ ] Notification preferences plumbing

## Week 4 � Auth & Settings
- [ ] Profile edit flow (name, genre preferences)
- [ ] Saved festivals list tied to Firestore
- [ ] Password reset + social auth entry points
- [ ] Onboarding and premium upsell drafts

## Data & Seeding
- [x] Create data/festivals.json with curated US festivals
- [x] Implement 	tools/seedFestivals.js script for Firestore seeding (admin SDK)
- [ ] Supply service account credentials via env (FIREBASE_SERVICE_ACCOUNT_PATH/JSON)
- [ ] Seed estivals collection and validate data
- [ ] Document monthly update workflow + staging collection option
- [ ] Source list: MusicFestivalWizard, Festival Survival Guide, JamBase, EDMTrain

## Documentation
- [x] Roadmap updated with completed tasks
- [x] README updated with seeding instructions
- [ ] Clean mojibake from legacy diagrams (Festival card, schedule row)
- [ ] Track future enhancements (onboarding, premium, recs)
