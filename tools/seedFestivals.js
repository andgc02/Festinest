const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const admin = require("firebase-admin");

const envPath = path.resolve(__dirname, "../apps/mobile/.env");
dotenv.config({ path: envPath });
dotenv.config();

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
let credential;

try {
  if (serviceAccountJson) {
    credential = admin.credential.cert(JSON.parse(serviceAccountJson));
  } else if (serviceAccountPath) {
    const resolved = path.resolve(serviceAccountPath);
    credential = admin.credential.cert(require(resolved));
  } else {
    throw new Error("Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON with admin credentials.");
  }
} catch (error) {
  console.error("Failed to load Firebase service account credentials:", error.message);
  process.exit(1);
}

admin.initializeApp({
  credential,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
});

const db = admin.firestore();
const dataPath = path.resolve(__dirname, "../data/festivals.json");

if (!fs.existsSync(dataPath)) {
  console.error(`Cannot find data file at ${dataPath}`);
  process.exit(1);
}

const festivals = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

async function seedFestivals() {
  if (!Array.isArray(festivals)) {
    throw new Error("Festival data must be an array.");
  }

  for (const fest of festivals) {
    if (!fest.id) {
      console.warn("Skipping festival without id:", fest);
      continue;
    }

    await db.collection("festivals").doc(fest.id).set(fest, { merge: true });
    console.log(`Seeded ${fest.name}`);
  }

  console.log("Seeding complete.");
  process.exit(0);
}

seedFestivals().catch((error) => {
  console.error("Failed to seed festivals:", error);
  process.exit(1);
});
