# Festinest Mobile

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Firebase setup

1. **Create the Firebase project**
   - Visit [Firebase Console](https://console.firebase.google.com) and create a project named `festinest`.
   - Enable Authentication, Firestore Database, and Storage (optional for later uploads).

2. **Register a web app**
   - In the Firebase console, open **Project settings → General → Your apps**.
   - Add a new **Web** app and copy the generated `firebaseConfig` snippet:

     ```js
     const firebaseConfig = {
       apiKey: '...',
       authDomain: '...',
       projectId: '...',
       storageBucket: '...',
       messagingSenderId: '...',
       appId: '...',
     };
     ```

3. **Populate environment variables**
   - Duplicate `.env.example` in this directory and rename it to `.env`.
   - Paste the values from the Firebase config into the matching `EXPO_PUBLIC_FIREBASE_*` entries.
   - Keep `.env` out of version control; `.gitignore` already handles it.

4. **Run the app**
   - Start Metro: `npm run start`.
   - When the app boots, `lib/firebase.ts` initializes Firebase using the env vars. If any value is missing, the app throws an error immediately so you can fix the configuration.
