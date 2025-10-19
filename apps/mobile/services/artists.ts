import {
  collection,
  doc,
  getDoc,
  getDocs,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';

import { mockArtists } from '@/data/mockArtists';
import { db } from '@/lib/firebase';
import { Artist, ArtistImageMeta, ArtistImageThumbnails } from '@/types/artist';

const COLLECTION_NAME = 'artists';

function mapArtist(document: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): Artist {
  const data = document.data() ?? {};

  const image = normalizeArtistImage(data.image);
  const photoUrl = resolvePrimaryPhotoUrl(data, image);

  return {
    id: document.id,
    name: typeof data.name === 'string' ? data.name : 'Artist',
    genres: Array.isArray(data.genres) ? data.genres.filter((genre): genre is string => typeof genre === 'string') : undefined,
    photoUrl,
    image,
    socials: normalizeArtistSocials(data.socials),
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
  };
}

function resolvePrimaryPhotoUrl(data: Record<string, unknown>, image?: ArtistImageMeta): string | undefined {
  const direct =
    (typeof data.photoUrl === 'string' && data.photoUrl) ||
    (typeof data.photo === 'string' && data.photo) ||
    (typeof data.imageUrl === 'string' && data.imageUrl);

  if (direct) {
    return direct;
  }

  const thumbnails = image?.thumbnails;
  if (!thumbnails) {
    return undefined;
  }

  const sorted = Object.keys(thumbnails)
    .map((key) => ({ key, size: Number(key) }))
    .sort((a, b) => {
      if (Number.isFinite(b.size) && Number.isFinite(a.size)) {
        return b.size - a.size;
      }
      if (Number.isFinite(b.size)) {
        return 1;
      }
      if (Number.isFinite(a.size)) {
        return -1;
      }
      return b.key.localeCompare(a.key);
    });

  for (const entry of sorted) {
    const url = thumbnails[entry.key];
    if (url) {
      return url;
    }
  }

  return undefined;
}

function normalizeArtistImage(value: unknown): ArtistImageMeta | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const thumbnails = normalizeThumbnails(record.thumbnails);

  return {
    source: typeof record.source === 'string' ? record.source : undefined,
    sourceUrl: typeof record.sourceUrl === 'string' ? record.sourceUrl : undefined,
    credit: typeof record.credit === 'string' ? record.credit : undefined,
    license: typeof record.license === 'string' ? record.license : undefined,
    licenseUrl: typeof record.licenseUrl === 'string' ? record.licenseUrl : undefined,
    wikidataId: typeof record.wikidataId === 'string' ? record.wikidataId : undefined,
    fileName: typeof record.fileName === 'string' ? record.fileName : undefined,
    thumbnails,
  };
}

function normalizeThumbnails(value: unknown): ArtistImageThumbnails | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const entries = Object.entries(value as Record<string, unknown>).filter(
    ([, url]) => typeof url === 'string',
  ) as Array<[string, string]>;

  if (!entries.length) {
    return undefined;
  }

  return entries.reduce<ArtistImageThumbnails>((acc, [key, url]) => {
    acc[key] = url;
    return acc;
  }, {});
}

function normalizeArtistSocials(value: unknown): Artist['socials'] {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const allowedKeys = ['spotify', 'instagram', 'soundcloud', 'twitter', 'website'] as const;
  const socials: Partial<Artist['socials']> = {};

  for (const key of allowedKeys) {
    const url = (value as Record<string, unknown>)[key];
    if (typeof url === 'string') {
      socials[key] = url;
    }
  }

  return Object.keys(socials).length ? socials : undefined;
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
