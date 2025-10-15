import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { mockFestivals } from '@/data/mockFestivals';
import { Festival } from '@/types/festival';

const COLLECTION_NAME = 'festivals';

export async function fetchFestivals(): Promise<Festival[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));

    if (snapshot.empty) {
      return mockFestivals;
    }

    return snapshot.docs.map((document) => {
      const data = document.data();
      return {
        id: document.id,
        name: data.name ?? 'Festival',
        location: data.location ?? 'TBA',
        startDate: data.startDate ?? '',
        endDate: data.endDate ?? '',
        genre: data.genre,
        artistsCount: Array.isArray(data.lineup) ? data.lineup.length : data.artistsCount,
        lineup: data.lineup,
        schedule: data.schedule,
      } satisfies Festival;
    });
  } catch (error) {
    console.warn('Failed to fetch festivals, falling back to mock data', error);
    return mockFestivals;
  }
}

export async function fetchFestivalById(festivalId: string): Promise<Festival | undefined> {
  try {
    const reference = doc(db, COLLECTION_NAME, festivalId);
    const snapshot = await getDoc(reference);

    if (!snapshot.exists()) {
      return mockFestivals.find((festival) => festival.id === festivalId);
    }

    const data = snapshot.data();

    return {
      id: snapshot.id,
      name: data.name ?? 'Festival',
      location: data.location ?? 'TBA',
      startDate: data.startDate ?? '',
      endDate: data.endDate ?? '',
      genre: data.genre,
      artistsCount: Array.isArray(data.lineup) ? data.lineup.length : data.artistsCount,
      lineup: data.lineup,
      schedule: data.schedule,
    } satisfies Festival;
  } catch (error) {
    console.warn(`Failed to fetch festival ${festivalId}, falling back to mock data`, error);
    return mockFestivals.find((festival) => festival.id === festivalId);
  }
}
