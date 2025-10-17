import { collection, doc, getDoc, getDocs, type DocumentData, type DocumentSnapshot, type QueryDocumentSnapshot } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { mockArtists } from '@/data/mockArtists';
import { Artist } from '@/types/artist';

const COLLECTION_NAME = 'artists';

function mapArtist(document: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): Artist {
  const data = document.data() ?? {};

  return {
    id: document.id,
    name: data.name ?? 'Artist',
    genres: data.genres,
    photoUrl: data.photoUrl ?? data.photo ?? data.imageUrl,
    socials: data.socials,
    updatedAt: data.updatedAt,
  } satisfies Artist;
}

export async function fetchArtists(): Promise<Artist[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));

    if (snapshot.empty) {
      return mockArtists;
    }

    return snapshot.docs.map((document) => mapArtist(document));
  } catch (error) {
    console.warn('Failed to fetch artists, falling back to mock data', error);
    return mockArtists;
  }
}

export async function fetchArtistById(artistId: string): Promise<Artist | undefined> {
  try {
    const reference = doc(db, COLLECTION_NAME, artistId);
    const snapshot = await getDoc(reference);

    if (!snapshot.exists()) {
      return mockArtists.find((artist) => artist.id === artistId);
    }

    return mapArtist(snapshot);
  } catch (error) {
    console.warn(`Failed to fetch artist ${artistId}, falling back to mock data`, error);
    return mockArtists.find((artist) => artist.id === artistId);
  }
}

