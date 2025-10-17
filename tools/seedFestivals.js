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
const attendanceDir = path.resolve(__dirname, "../data/attendance");

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
const attendanceFiles = readJsonFiles(attendanceDir);

if (!festivalFiles.length) {
  console.warn(`No festival json files found in ${festivalsDir}`);
}

if (!artistFiles.length) {
  console.warn(`No artist json files found in ${artistsDir}`);
}

if (!attendanceFiles.length) {
  console.warn(`No attendance json files found in ${attendanceDir}`);
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
      idSet.add(String(artistId).toLowerCase());
    } catch (error) {
      console.error(`Failed to process artist file ${filename}:`, error.message);
    }
  }

  return { items, idSet };
}

function validateFestival(festival, filename, knownArtistIds) {
  const issues = [];

  const validateEntries = (entries, bucket) => {
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

  validateEntries(festival.lineup, "lineup");
  validateEntries(festival.schedule, "schedule");

  return issues;
}

function loadFestivals(knownArtistIds) {
  const items = [];
  const idSet = new Set();
  const issues = [];

  for (const { filename, filePath } of festivalFiles) {
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const fest = JSON.parse(raw);
      const festivalId = fest.id ?? path.basename(filename, path.extname(filename));

      if (!festivalId) {
        console.warn(`Skipping ${filename} because it is missing an id.`);
        continue;
      }

      const festivalIssues = validateFestival(fest, filename, knownArtistIds);
      if (festivalIssues.length) {
        console.warn(`Validation issues in ${filename}:`);
        festivalIssues.forEach((issue) => console.warn(`  - ${issue}`));
        issues.push(...festivalIssues);
      }

      const document = {
        ...fest,
        id: festivalId,
        genre: fest.genre ?? (Array.isArray(fest.genres) ? fest.genres.join(", ") : undefined),
        lastUpdated: fest.lastUpdated ?? new Date().toISOString(),
      };

      items.push({ id: festivalId, document, filename });
      idSet.add(String(festivalId).toLowerCase());
    } catch (error) {
      console.error(`Failed to process ${filename}:`, error.message);
    }
  }

  return { items, idSet, issues };
}

function loadAttendance(knownArtistIds, knownFestivalIds) {
  const items = [];
  const issues = [];

  for (const { filename, filePath } of attendanceFiles) {
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(raw);
      const festivalId = data.festivalId ?? path.basename(filename, path.extname(filename));

      if (!festivalId) {
        issues.push(`${filename}: missing festivalId`);
        continue;
      }

      const normalizedFestivalId = String(festivalId).toLowerCase();
      if (!knownFestivalIds.has(normalizedFestivalId)) {
        issues.push(`${filename}: festivalId "${festivalId}" does not match any festival json file`);
      }

      const entries = Array.isArray(data.entries) ? data.entries : [];
      entries.forEach((entry, index) => {
        const context = `${filename} → entries[${index}]`;
        const artistId = entry.artistId;

        if (!artistId) {
          issues.push(`${context}: missing artistId`);
          return;
        }

        if (!knownArtistIds.has(String(artistId).toLowerCase())) {
          issues.push(`${context}: artistId "${artistId}" does not match any artist json file`);
          return;
        }

        const docId = `${festivalId}_${artistId}`;
        items.push({
          id: docId,
          document: {
            festivalId,
            artistId,
            goingCount: typeof entry.goingCount === "number" && entry.goingCount >= 0 ? entry.goingCount : 0,
            updatedAt: entry.updatedAt ?? data.updatedAt ?? new Date().toISOString(),
          },
          filename,
        });
      });
    } catch (error) {
      console.error(`Failed to process attendance file ${filename}:`, error.message);
    }
  }

  if (issues.length) {
    console.warn("Attendance validation issues:");
    issues.forEach((issue) => console.warn(`  - ${issue}`));
  }

  return { items, issues };
}

async function seedCollection(collectionName, items, options) {
  if (!items.length) {
    return 0;
  }

  if (options.dryRun) {
    console.log(`[dry-run] Skipping write of ${items.length} ${collectionName} document(s).`);
    return items.length;
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
  return items.length;
}

async function seedAttendance(items, options) {
  if (!items.length) {
    return 0;
  }

  if (options.dryRun) {
    console.log(`[dry-run] Skipping write of ${items.length} festivalAttendees document(s).`);
    return items.length;
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
    const ref = db.collection("festivalAttendees").doc(id);
    batch.set(ref, document, { merge: true });
    writesInBatch += 1;

    if (writesInBatch >= BATCH_WRITE_LIMIT) {
      await commitBatch();
    }
  }

  await commitBatch();
  return items.length;
}

function parseOptions() {
  const args = process.argv.slice(2);
  const validate = args.includes("--validate");
  const dryRun = validate || args.includes("--dry-run");
  const strict = validate || args.includes("--strict");

  return { validate, dryRun, strict };
}

async function run() {
  const options = parseOptions();
  const { items: artistItems, idSet: artistIds } = loadArtists();
  const { items: festivalItems, idSet: festivalIds, issues: festivalIssues } = loadFestivals(artistIds);
  const { items: attendanceItems, issues: attendanceIssues } = loadAttendance(artistIds, festivalIds);

  const validationIssues = [...festivalIssues, ...attendanceIssues];

  if (options.validate) {
    if (validationIssues.length) {
      console.error(`Validation failed with ${validationIssues.length} issue(s).`);
      validationIssues.forEach((issue) => console.error(`  - ${issue}`));
      process.exit(1);
    } else {
      console.log("Validation passed with no issues detected.");
      process.exit(0);
    }
  }

  if (validationIssues.length) {
    console.warn(
      `Validation discovered ${validationIssues.length} issue(s). Proceeding because strict mode is disabled.`,
    );
  }

  const seededArtists = await seedCollection("artists", artistItems, options);
  if (!options.dryRun) {
    console.log(`Seeded ${seededArtists} artist document(s).`);
  }

  const seededFestivals = await seedCollection("festivals", festivalItems, options);
  if (!options.dryRun) {
    console.log(`Seeded ${seededFestivals} festival document(s).`);
  }

  const seededAttendance = await seedAttendance(attendanceItems, options);
  if (!options.dryRun) {
    console.log(`Seeded ${seededAttendance} festival attendee document(s).`);
  }

  if (options.dryRun) {
    console.log("Dry run complete.");
  } else {
    console.log("Seeding complete.");
  }
  process.exit(0);
}

run().catch((error) => {
  console.error("Failed to seed data:", error);
  process.exit(1);
});

