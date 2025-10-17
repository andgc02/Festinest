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
const festivalsDir = path.resolve(__dirname, "../data/festivals");
const artistsDir = path.resolve(__dirname, "../data/artists");

function readJsonFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs
    .readdirSync(directory)
    .filter((filename) => filename.toLowerCase().endsWith(".json"))
    .sort()
    .map((filename) => ({ filename, filePath: path.join(directory, filename) }));
}

const festivalFiles = readJsonFiles(festivalsDir);
const artistFiles = readJsonFiles(artistsDir);

if (!festivalFiles.length) {
  console.warn(`No festival json files found in ${festivalsDir}`);
}

if (!artistFiles.length) {
  console.warn(`No artist json files found in ${artistsDir}`);
}

const BATCH_WRITE_LIMIT = 400;

function loadArtists() {
  const items = [];
  const idSet = new Set();

  for (const { filename, filePath } of artistFiles) {
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const artist = JSON.parse(raw);
      const artistId = artist.id ?? path.basename(filename, path.extname(filename));

      if (!artistId) {
        console.warn(`Skipping ${filename} because it is missing an id.`);
        continue;
      }

      const document = {
        ...artist,
        id: artistId,
        updatedAt: artist.updatedAt ?? new Date().toISOString(),
      };

      items.push({ id: artistId, document, filename });
      idSet.add(artistId.toLowerCase());
    } catch (error) {
      console.error(`Failed to process artist file ${filename}:`, error.message);
    }
  }

  return { items, idSet };
}

function validateFestival(festival, filename, knownArtistIds) {
  const issues = [];

  const checkEntries = (entries, bucket) => {
    if (!Array.isArray(entries)) {
      return;
    }

    entries.forEach((entry, index) => {
      const context = `${filename} → ${bucket}[${index}]`;

      if (!entry.artistId) {
        issues.push(`${context}: missing artistId (artist "${entry.artist ?? entry.artistName ?? "Unknown"}")`);
        return;
      }

      if (!knownArtistIds.has(String(entry.artistId).toLowerCase())) {
        issues.push(`${context}: artistId "${entry.artistId}" does not match any artist json file`);
      }

      if (!entry.day) {
        issues.push(`${context}: missing day for artistId "${entry.artistId}"`);
      }
      if (!entry.stage) {
        issues.push(`${context}: missing stage for artistId "${entry.artistId}"`);
      }
      if (!entry.time) {
        issues.push(`${context}: missing time for artistId "${entry.artistId}"`);
      }
    });
  };

  checkEntries(festival.lineup, "lineup");
  checkEntries(festival.schedule, "schedule");

  if (issues.length) {
    console.warn(`Validation issues in ${filename}:`);
    issues.forEach((issue) => console.warn(`  - ${issue}`));
  }
}

async function seedCollection(collectionName, items) {
  if (!items.length) {
    return;
  }

  let batch = db.batch();
  let writesInBatch = 0;

  const commitBatch = async () => {
    if (writesInBatch === 0) {
      return;
    }
    await batch.commit();
    batch = db.batch();
    writesInBatch = 0;
  };

  for (const { id, document } of items) {
    const ref = db.collection(collectionName).doc(id);
    batch.set(ref, document, { merge: true });
    writesInBatch += 1;

    if (writesInBatch >= BATCH_WRITE_LIMIT) {
      await commitBatch();
    }
  }

  await commitBatch();
}

function loadFestivals(knownArtistIds) {
  const items = [];

  for (const { filename, filePath } of festivalFiles) {
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const fest = JSON.parse(raw);
      const festivalId = fest.id ?? path.basename(filename, path.extname(filename));

      if (!festivalId) {
        console.warn(`Skipping ${filename} because it is missing an id.`);
        continue;
      }

      validateFestival(fest, filename, knownArtistIds);

      const document = {
        ...fest,
        id: festivalId,
        genre: fest.genre ?? (Array.isArray(fest.genres) ? fest.genres.join(", ") : undefined),
        lastUpdated: fest.lastUpdated ?? new Date().toISOString(),
      };

      items.push({ id: festivalId, document, filename });
    } catch (error) {
      console.error(`Failed to process ${filename}:`, error.message);
    }
  }

  return items;
}

async function run() {
  const { items: artistItems, idSet: artistIds } = loadArtists();
  const festivalItems = loadFestivals(artistIds);

  await seedCollection("artists", artistItems);
  console.log(`Seeded ${artistItems.length} artist document(s).`);

  await seedCollection("festivals", festivalItems);
  console.log(`Seeded ${festivalItems.length} festival document(s).`);

  console.log("Seeding complete.");
  process.exit(0);
}

run().catch((error) => {
  console.error("Failed to seed data:", error);
  process.exit(1);
});
