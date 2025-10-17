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
const dataDir = path.resolve(__dirname, "../data/festivals");

if (!fs.existsSync(dataDir)) {
  console.error(`Cannot find data directory at ${dataDir}`);
  process.exit(1);
}

const festivalFiles = fs
  .readdirSync(dataDir)
  .filter((filename) => filename.toLowerCase().endsWith(".json"))
  .sort();

if (!festivalFiles.length) {
  console.warn(`No festival json files found in ${dataDir}`);
}

async function seedFestivals() {
  for (const filename of festivalFiles) {
    const filePath = path.join(dataDir, filename);

    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const fest = JSON.parse(raw);

      const festivalId = fest.id ?? path.basename(filename, path.extname(filename));

      if (!festivalId) {
        console.warn(`Skipping ${filename} because it is missing an id.`);
        continue;
      }

      const document = {
        ...fest,
        id: festivalId,
        genre: fest.genre ?? (Array.isArray(fest.genres) ? fest.genres.join(", ") : undefined),
        lastUpdated: fest.lastUpdated ?? new Date().toISOString(),
      };

      await db.collection("festivals").doc(festivalId).set(document, { merge: true });
      console.log(`Seeded ${festivalId} from ${filename}`);
    } catch (error) {
      console.error(`Failed to process ${filename}:`, error.message);
    }
  }

  console.log("Seeding complete.");
  process.exit(0);
}

seedFestivals().catch((error) => {
  console.error("Failed to seed festivals:", error);
  process.exit(1);
});
