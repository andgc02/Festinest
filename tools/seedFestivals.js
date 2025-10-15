const { initializeApp } = require('firebase/app');
const { getFirestore, setDoc, doc } = require('firebase/firestore');
const festivals = require('../data/festivals.json');
const dotenv = require('dotenv');

dotenv.config({ path: '../apps/mobile/.env' });

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedFestivals() {
  for (const fest of festivals) {
    await setDoc(doc(db, 'festivals', fest.id), fest);
    console.log(Seeded );
  }
}

seedFestivals().catch((error) => {
  console.error('Failed to seed festivals', error);
  process.exit(1);
});
