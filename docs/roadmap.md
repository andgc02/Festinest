# Festinest Product Roadmap (Updated Oct 2025)

## ✅ Completed
- Expo Router stack + tab layout with login gating (`apps/mobile/app/_layout.tsx`, `apps/mobile/app/(tabs)/_layout.tsx`).
- Firebase Auth integration with persistent sessions and admin seeding.
- NativeWind/Tailwind design system scaffolding (shared colors, spacing, presets).
- Base UI primitives: `Button`, `Input`, `SearchBar`, `Card`.
- Festival list & detail screens reading Firestore with mock fallback.
- Schedule builder placeholder using Firebase data.
- Settings screen wired to Firebase auth logout.
- Docs directory established with live roadmap and seeding plan.

## 🚧 In Progress
- Expand component library (FilterChip, Tabs, Toasts).
- Replace placeholders with Tailwind-driven screens (Group, Schedule).
- Clean typography tokens to remove mojibake from legacy docs.

## ⏭️ Upcoming (Week 1 Foundations)
1. NativeWind component polish
   - Build `FilterPill`, `Avatar`, `AvatarGroup`.
   - Create consistent typography utility classes.
2. Navigation refinements
   - Add type-safe routes (enable `expo-router` typed routes).
   - Implement authentication guard hooks.
3. Theming
   - Centralize theme tokens in `constants/theme.ts`.
   - Provide light/dark variations for primary/accent colors.

Continue following the execution timeline below.

## 1. Core MVP Screens
| Screen | Status | Next Steps | Notes |
| --- | --- | --- | --- |
| FestivalList | ✅ | Add filter interactions; debounce search | Uses `Card` + `SearchBar` components |
| FestivalDetail | ✅ | Wire saved festivals CTA to Firestore | Add lineup expand/collapse |
| ScheduleBuilder | ✅ | Implement conflict detection & persistence | Use `Tabs` component for day switching |
| Group | ⏳ | Build group chat preview + vote UI | Requires Firestore group schema |
| Settings | ✅ | Hook profile update & genre picker | Add notification toggles |

## 2. Reusable UI Library
- **Completed:** `Button`, `Input`, `SearchBar`, `Card`.
- **Planned:** `Avatar`, `AvatarGroup`, `Tabs`, `Modal`, `Toast`, `Toggle`.
- **Guidelines:** Mimic shadcn/Tailwind UI; rely on design tokens from `tailwind.config`.

## 3. Design System
- Typography utilities pending; adopt Tailwind naming:
  - Headings: `text-[28px] font-semibold`
  - Body: `text-base text-slate-200`
  - Caption: `text-xs text-slate-400`
- Color palette set in `tailwind.config.js`:
  - Primary `#5A67D8`
  - Accent `#38B2AC`
  - Warning `#F6AD55`
  - Error `#E53E3E`
  - Background `#0F172A` / `#F7FAFC`
- Spacing:
  - Cards: `rounded-2xl p-4 shadow-card`
  - Buttons: `rounded-xl px-6 py-3`
  - Avatars: `h-10 w-10 rounded-full`

## 4. Layout References (To Refresh)
- Update diagrams in a future pass to remove mojibake imports.
- Add Figma references for:
  - Festival Card
  - Schedule Row
  - Group Chat bubble
  - AvatarGroup

## 5. Execution Timeline
### Week 1 (now)
- ✅ Expo Router + auth gating.
- ✅ NativeWind + base components.
- 🔜 Expand component library and theming.

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
- Navigation: `expo-router`
- Styling: `nativewind`
- Icons: `@expo/vector-icons`
- QR Codes: `react-native-qrcode-svg`
- Date utils: `date-fns`
- Backend: `firebase`, optional `firebase-admin` for scripts

## 7. Enhancements / Stretch
- Onboarding tour.
- Premium upsell flow.
- Genre-based recommendations.
- Offline map caching.
