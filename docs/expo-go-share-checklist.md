# Expo Go Share Build & QA Checklist

_Last updated: Oct 2025_

Use this guide when preparing an internal Expo Go demo build. It covers the shareable build flow and the smoke tests we expect before handing the QR code to stakeholders.

---

## 1. Pre-flight

- ✅ Install Node 18+ and the Expo CLI (`npm install -g expo-cli` or use `npx expo`).
- ✅ Ensure `.env` (or `.env.local`) contains the required `EXPO_PUBLIC_FIREBASE_*` values plus any seeded demo credentials.
- ✅ Confirm you are logged in to the Expo account used for Festinest (`npx expo login`).
- ✅ Run `npm install` at the repo root to sync dependencies.
- ✅ (Optional) Clear cached Metro state with `npx expo start --clear` if you have not run the app recently.

---

## 2. Create a Shareable Expo Go Session

1. **Start the packager in tunnel mode** (shares beyond the local network):
   ```bash
   npx expo start --tunnel
   ```
   - Use `--clear` on the first run of the day to avoid stale bundles.
   - Keep this terminal open; closing it invalidates the QR code.
2. **Wait for the Metro bundler to finish** the initial build (look for “Expo Metro Bundler is ready.”).
3. **Grab the QR code or link**:
   - In the CLI press `s` to open Expo Dev Tools in the browser, then copy the QR or the “Share” link.
   - Alternatively, press `w` to have the web dashboard open automatically.
4. **Distribute to testers**:
   - Ask them to install the Expo Go app (latest version) on their device.
   - Provide the link/QR and confirm they can launch the Festinest bundle.
   - Remind them to keep Expo Go open while testing; backgrounding for too long may require a reload.

---

## 3. QA Smoke Checklist

### Authentication & Session
- [ ] Launch Expo Go, open the shared project, and verify the login screen renders.
- [ ] Sign in with demo credentials; confirm navigation to the home tabs.
- [ ] Sign out and ensure you return to the login gate.
- [ ] Attempt an invalid password to confirm error messaging is surfaced.

### Festival List
- [ ] Skeleton loaders appear while data is fetched, then resolve to festival cards.
- [ ] Search by festival name (e.g., “Coachella”) updates the list.
- [ ] Toggle Genre/Date/Location filters; confirm results adjust and “No festivals found” empty state renders when appropriate.
- [ ] Pull-to-refresh triggers the skeleton state again without errors.

### Festival Detail
- [ ] Opening a festival shows hero details, chips, and lineup sections.
- [ ] Toggling “Add to My Festivals” updates the button label and triggers the toast.
- [ ] Schedule accordion expands/collapses and renders artist metadata + socials.
- [ ] “Share Group” CTA opens the modal; closing it resets state cleanly.

### Group Screen
- [ ] From a festival, open the group screen (`Share QR` or direct navigation).
- [ ] Schedule votes load (or the empty state appears if no data).
- [ ] Tapping a set increments/decrements your vote pill and persists after refresh.
- [ ] Chat tab shows preview bubbles or the empty state copy.

### Saved Festivals & Settings
- [ ] Navigate to the Saved tab to confirm festivals marked above appear.
- [ ] Visit Settings and verify saved festivals list + genre preferences render without runtime errors.

### Visual / UX
- [ ] Light theme surfaces look consistent (status bar, tab highlight, chips).
- [ ] Skeleton shimmer animates smoothly without clipping.
- [ ] No overlapping toasts, modals, or crash dialogs when navigating quickly.

---

## 4. Troubleshooting Tips

- **QR won’t load**: Run `npx expo login` and restart with `npx expo start --tunnel --clear`.
- **Device stuck on splash**: Shake device (or press `Ctrl + m` / `Cmd + d`) to open developer menu and “Reload”.
- **Expo Go cache issues**: Force close Expo Go, reopen, and use “Projects → Recently opened” or rescan the QR.
- **Authentication failures**: Confirm Firebase rules allow Email/Password and the seeded user exists.

---

## 5. Wrap-up

- Capture device + OS used, plus screenshots of any regressions.
- File QA notes in the sprint board or shared doc alongside the Expo session URL.
- When finished, stop the Metro process (`Ctrl + C`) to invalidate the QR.

> Tip: For asynchronous demos, consider `npx expo export --platform ios` / `--platform android` and hosting the static build, but the tunnel-based Expo Go share is fastest for internal runs.

