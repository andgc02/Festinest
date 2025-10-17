import { collection, doc, getDoc, getDocs, type DocumentData, type DocumentSnapshot, type QueryDocumentSnapshot } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { mockFestivals } from '@/data/mockFestivals';
import { Festival } from '@/types/festival';

const COLLECTION_NAME = 'festivals';

function mapFestival(document: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): Festival {
  const data = document.data() ?? {};
  const genresArray = Array.isArray(data.genres) ? data.genres : undefined;

  return {
    id: document.id,
    name: data.name ?? 'Festival',
    location: data.location ?? 'TBA',
    startDate: data.startDate ?? '',
    endDate: data.endDate ?? '',
    genre: data.genre ?? (genresArray ? genresArray.join(', ') : undefined),
    genres: genresArray,
    status: data.status,
    website: data.website,
    ticketUrl: data.ticketUrl,
    lastUpdated: data.lastUpdated,
    artistsCount: data.artistsCount ?? (Array.isArray(data.lineup) ? data.lineup.length : undefined),
    lineup: data.lineup,
    schedule: data.schedule,
  } satisfies Festival;
}

export async function fetchFestivals(): Promise<Festival[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));

    if (snapshot.empty) {
      return mockFestivals;
    }

    return snapshot.docs.map((document) => mapFestival(document));
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

    return mapFestival(snapshot);
  } catch (error) {
    console.warn(`Failed to fetch festival ${festivalId}, falling back to mock data`, error);
    return mockFestivals.find((festival) => festival.id === festivalId);
  }
}
