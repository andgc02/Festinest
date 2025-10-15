# Festinest Product Roadmap

## 1. Core MVP Screens

### 1.1 FestivalListScreen
- Festival cards with search (debounced) and filters (location, genre, month).
- Components: `FestivalCard`, `SearchBar`, `FilterPill`, `EmptyState`.

### 1.2 FestivalDetailScreen
- Display festival metadata, lineup, and calls to action.
- Components: `FestivalHeader`, `LineupItem`, `AddToScheduleButton`, `FestivalMapThumbnail` (optional).

### 1.3 ScheduleBuilderScreen
- Daily timeline with selectable artists, conflict highlighting, and save action.
- Components: `ScheduleRow`, `ConflictBadge`, `SaveButton`, `DateSwitcherTabs`.

### 1.4 GroupScreen
- Group overview with member avatars, shared schedule votes, chat, and invite flows.
- Components: `AvatarGroup`, `VoteBar`, `GroupChatList`, `InviteQR`.

### 1.5 SettingsScreen
- Editable profile, preferred genres, notifications, logout, and app metadata.
- Components: `ProfileCard`, `GenrePicker`, `ToggleSwitch`.

## 2. Reusable UI Library
- Establish a shared design system inspired by Tailwind UI / shadcn.
- Core primitives: `Button`, `Input`, `SearchBar`, `Avatar`, `AvatarGroup`, `Card`, `Tabs`, `Modal`, `Toast`.

## 3. Design System
- Typography: `text-xl font-bold` (headings), `text-base text-gray-800` (body), `text-sm text-gray-500` (captions).
- Color palette:
  - Primary: `#5A67D8`
  - Background: `#F7FAFC`
  - Accent: `#38B2AC`
  - Warning: `#F6AD55`
  - Error: `#E53E3E`
- Spacing and sizing:
  - Cards: `rounded-2xl p-4 shadow-md`
  - Buttons: `rounded-xl px-6 py-3`
  - Avatars: `h-10 w-10 rounded-full`

## 4. Layout References
- **Festival Card**
  ```
  -----------------------------
  | 🎫 [Festival Name]        |
  | 📍 [Location]             |
  | 🗓️ Apr 11–13 | 120 artists |
  -----------------------------
  ```
- **Schedule Row**
  ```
  -------------------------------------
  | 1:00pm – Fred Again..      [✔️]   |
  | Stage: Sahara                ⋮    |
  -------------------------------------
  ```
- **Group Chat Bubble**
  ```
  Taylor: “Let’s meet before Fred Again..”
  🕒 10:15 AM
  ```
- **AvatarGroup**
  ```
  [🧑][🧑][🧑] +2
  ```

## 5. Execution Timeline
- **Week 1: Foundations**
  - Expo Router layout, navigation scaffolding.
  - Shared UI component groundwork.
  - Theming with Tailwind/NativeWind.
- **Week 2: Core Screens**
  - Festival list/detail flows.
  - Schedule builder with conflict logic.
  - Seed Firestore with sample data.
- **Week 3: Social Features**
  - Group creation and shared schedules.
  - Voting interactions.
  - QR invite flow (Expo QR + UUID).
- **Week 4: Auth & Settings**
  - Firebase email/password auth.
  - User preferences (genres, saved festivals).
  - Complete settings experience.

## 6. Recommended Packages
- Navigation: `expo-router`
- Styling: `nativewind`
- Icons: `react-native-vector-icons`
- QR Codes: `react-native-qrcode-svg`
- Dates: `dayjs` or `date-fns`
- Backend: `firebase` + `expo-dev-client`

## 7. Optional Enhancements
- Onboarding flow.
- Premium upsell screen.
- Extended sample data covering multiple festival genres.
