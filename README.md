# Festinest Monorepo

## Apps
- apps/mobile: Expo React Native client

## Docs & Data
- docs/festival_app_business_plan.md
- docs/expo-go-share-checklist.md
- docs/roadmap.md
- docs/todo.md
- data/festivals/* (curated festival list)
- tools/seedFestivals.js (Firestore seeding script)

## Quick Start (Mobile)
1. Install dependencies: npm install
2. Run Metro: npm run start
3. Lint: npm run lint
4. Check docs/roadmap.md and docs/todo.md for current tasks.

## Firestore Seeding
1. Create a Firebase service account with Firestore Admin access.
2. Provide credentials via either environment variable:
   - `FIREBASE_SERVICE_ACCOUNT_PATH` (path to JSON file)
   - `FIREBASE_SERVICE_ACCOUNT_JSON` (stringified JSON)
3. Ensure `EXPO_PUBLIC_FIREBASE_*` variables point to the same project.
4. From repo root, use these scripts:
   - `npm run seed:all` (seed artists, festivals, attendance)
   - Targeted:
     - `npm run seed:artists`
     - `npm run seed:festivals` (just festivals)
     - `npm run seed:attendance`
     - `npm run seed:skip:attendance`
   - Safety:
     - `npm run seed:validate` (validate references; no writes)
     - `npm run seed:dry-run` (preview writes; no writes)

Notes
- The seeder always loads artists first to validate festival references.
- Documents are upserted by `id` in batched writes.

