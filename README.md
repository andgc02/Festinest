# Festinest Monorepo

## Apps
- apps/mobile: Expo React Native client

## Docs & Data
- docs/festival_app_business_plan.md
- docs/expo-go-share-checklist.md
- docs/roadmap.md
- docs/todo.md
- data/festivals.json (curated festival list)
- tools/seedFestivals.js (Firestore seeding script)

## Quick Start (Mobile)
1. Install dependencies: npm install
2. Run Metro: npm run start
3. Lint: npm run lint
4. Check docs/roadmap.md and docs/todo.md for current tasks.

## Firestore Seeding
1. Create a Firebase service account with Firestore Admin access.
2. Provide credentials via either environment variable:
   - FIREBASE_SERVICE_ACCOUNT_PATH (path to JSON file)
   - FIREBASE_SERVICE_ACCOUNT_JSON (stringified JSON)
3. Ensure EXPO_PUBLIC_FIREBASE_* variables point to the same project.
4. Run: npm run seed:festivals

The script upserts documents under the festivals collection.
