# Festinest Product Roadmap (Updated Oct 2025)

## ? Completed
- Expo Router stack + tab layout with login gating (pps/mobile/app/_layout.tsx, pps/mobile/app/(tabs)/_layout.tsx).
- Firebase Auth integration with persistent sessions and admin seeding.
- NativeWind/Tailwind design system scaffolding (shared colors, spacing, presets).
- Base UI primitives: Button, Input, SearchBar, Card.
- Festival list & detail screens reading Firestore with mock fallback.
- Schedule builder placeholder using Firebase data.
- Settings screen wired to Firebase auth logout.
- Docs directory established with live roadmap and seeding plan.

## ?? In Progress
- Expand component library (FilterChip, Tabs, Toasts).
- Replace placeholders with Tailwind-driven screens (Group, Schedule).
- Clean typography tokens to remove mojibake from legacy docs.

## ?? Upcoming (Week 1 Foundations)
1. NativeWind component polish
   - Build FilterPill, Avatar, AvatarGroup.
   - Create consistent typography utility classes.
2. Navigation refinements
   - Add type-safe routes (enable expo-router typed routes).
   - Implement authentication guard hooks.
3. Theming
   - Centralize theme tokens in constants/theme.ts.
   - Provide light/dark variations for primary/accent colors.

Continue following the execution timeline below.

## 1. Core MVP Screens
| Screen | Status | Next Steps | Notes |
| --- | --- | --- | --- |
| FestivalList | ? | Add filter interactions; debounce search | Uses Card + SearchBar components |
| FestivalDetail | ? | Wire saved festivals CTA to Firestore | Add lineup expand/collapse |
| ScheduleBuilder | ? | Implement conflict detection & persistence | Use Tabs component for day switching |
| Group | ? | Build group chat preview + vote UI | Requires Firestore group schema |
| Settings | ? | Hook profile update & genre picker | Add notification toggles |

## 2. Reusable UI Library
- **Completed:** Button, Input, SearchBar, Card.
- **Planned:** Avatar, AvatarGroup, Tabs, Modal, Toast, Toggle.
- **Guidelines:** Mimic shadcn/Tailwind UI; rely on design tokens from 	ailwind.config.

## 3. Design System
- Typography utilities pending; adopt Tailwind naming:
  - Headings: 	ext-[28px] font-semibold
  - Body: 	ext-base text-slate-200
  - Caption: 	ext-xs text-slate-400
- Color palette set in 	ailwind.config.js:
  - Primary #5A67D8
  - Accent #38B2AC
  - Warning #F6AD55
  - Error #E53E3E
  - Background #0F172A / #F7FAFC
- Spacing:
  - Cards: ounded-2xl p-4 shadow-card
  - Buttons: ounded-xl px-6 py-3
  - Avatars: h-10 w-10 rounded-full

## 4. Layout References (To Refresh)
- Update diagrams in a future pass to remove mojibake imports.
- Add Figma references for:
  - Festival Card
  - Schedule Row
  - Group Chat bubble
  - AvatarGroup

## 5. Execution Timeline
### Week 1 (now)
- ? Expo Router + auth gating.
- ? NativeWind + base components.
- ?? Expand component library and theming.

### Week 2
- Implement Festival detail interactions.
- Schedule conflict logic.
- Firestore seeding with realistic data.

### Week 3
- Group collaboration (votes, chat preview).
- QR invite flow.
- Notifications groundwork.

### Week 4
- Full settings UX.
- Saved festivals & preferences.
- Polish auth + onboarding flows.

## 6. Recommended Packages
- Navigation: expo-router
- Styling: 
ativewind
- Icons: @expo/vector-icons
- QR Codes: eact-native-qrcode-svg
- Date utils: date-fns
- Backend: irebase, optional irebase-admin for scripts

## 7. Enhancements / Stretch
- Onboarding flow.
- Premium upsell screen.
- Genre-based recommendations.
- Offline map caching.

## 8. Data Pipeline (Manual Curation + Script)
- Maintain curated data/festivals.json file (monthly refresh).
- Use 	ools/seedFestivals.js + service account to upsert Firestore estivals docs.
- Optional staging collection (estivals_staging) before production promotion.
- Suggested data sources: MusicFestivalWizard, Festival Survival Guide, JamBase, EDMTrain.
- Document change log in docs/todo.md when new festivals added.

## 🧼 Recommended Fixes + Cleanups

1. Fix Mojibake and Character Encoding Errors  
   You've got encoding issues that crept in - likely from pasting between editors or OS locales. These should be cleaned so the files are readable by all devs and safe for Git.

   | Issue | Fix |
   | --- | --- |
   | � | Replace with a real em dash or bullet |
   | pps/mobile/... | Replace `pps` with `apps` |
   | ools/seedFestivals.js | Should be `tools/seedFestivals.js` |
   | estivals.json | Should be `festivals.json` |
   | ailwind.config.js | Should be `tailwind.config.js` |
   | ounded-2xl | Should be `rounded-2xl` |
   | ext-[28px] | Should be `text-[28px]` |
   | ext-base | Should be `text-base` |
   | ativewind | Should be `nativewind` |
   | eact-native-qrcode-svg | Should be `react-native-qrcode-svg` |
   | irebase | Should be `firebase` |

   🛠 Tip: Run a find/replace in VSCode using regex to catch common non-ASCII characters.

2. Clarify Status Tags in Checkboxes and Tables  
   Instead of `?`, consider using icons like ✅ for completed, 🔄 for in progress, ⏳ or 🛠 for pending, and ❌ or ⚠️ for blocked or deprecated to make the roadmap easier to scan.

3. Add Figma Link Placeholder (or Component Image References)  
   Update the layout section with a checklist and placeholder links:
   - [ ] Add Figma link or image exports:
     - [ ] Festival Card
     - [ ] Schedule Row
     - [ ] Group Chat Bubble
     - [ ] AvatarGroup
   Even a placeholder like [Figma ->](https://www.figma.com/file/...) helps future collaborators.

4. Theme & Typography Consistency  
   Tighten the existing design tokens and add reusable utilities:
   - `text-[28px] font-semibold` -> `text-2xl md:text-[28px] font-semibold` for responsive headings.
   - `text-slate-200` -> `text-slate-800` for primary body copy contrast.
   - Keep spacing utilities such as `px-6 py-3` and `rounded-xl`.

   ```ts
   // constants/theme.ts
   export const FONT_SIZES = {
     heading: 'text-2xl font-semibold',
     body: 'text-base text-slate-800',
     caption: 'text-xs text-slate-400',
   };
   ```

5. Data Pipeline Section Refinement  
   Refresh the guidance for maintainability:
   - Store curated festivals in `data/festivals.json`.
   - Seed via `tools/seedFestivals.js` using the Firebase Admin SDK.
   - Promote documents from `festivals_staging` -> `festivals`.
   - Refresh monthly or quarterly.
   - Track additions in `docs/todo.md`.

6. Add Missing Todos  
   Capture supporting automation ideas:
   - [ ] Create `scripts/validateFestivals.ts` to lint JSON before seeding.
   - [ ] Add a shared `FestivalType` interface for both seeder and app.
   - [ ] (Optional) Set up a GitHub workflow to run `npm run seed:festivals` on pushes to `main`.

### ✅ Summary: Next Actions

| Action | Owner |
| --- | --- |
| Clean all mojibake text | You or Codex |
| Update README/roadmap for clarity | Optional polish |
| Export/insert Figma links or mock image exports | Optional design enhancement |
| Add a validation script for `festivals.json` | Codex can do this |
| Consider GitHub CI for seeding (`npm run seed:festivals`) | Later |
