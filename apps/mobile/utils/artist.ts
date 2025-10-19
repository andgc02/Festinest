import { Artist } from '@/types/artist';

const SOCIAL_LABELS: Record<string, string> = {
  spotify: 'Spotify',
  instagram: 'Instagram',
  soundcloud: 'SoundCloud',
  twitter: 'Twitter / X',
  website: 'Website',
};

export type ArtistSocialLink = {
  key: string;
  label: string;
  url: string;
};

export type ArtistImageAttribution = {
  credit?: string;
  license?: string;
  licenseUrl?: string;
  source?: string;
  sourceUrl?: string;
};

export function getArtistSocialLinks(artist?: Artist | null): ArtistSocialLink[] {
  if (!artist?.socials) {
    return [];
  }

  return Object.entries(artist.socials)
    .filter(([, url]) => Boolean(url))
    .map(([key, url]) => ({
      key,
      label: SOCIAL_LABELS[key] ?? key,
      url: String(url),
    }));
}

export function formatArtistGenres(artist?: Artist | null): string | undefined {
  if (!artist?.genres?.length) {
    return undefined;
  }

  return artist.genres.join(' / ');
}

export function getArtistImageUrl(artist?: Artist | null, preferredSize: 64 | 128 | 256 = 256): string | undefined {
  if (!artist) {
    return undefined;
  }

  const preferredKey = String(preferredSize);
  const thumbnails = artist.image?.thumbnails;

  if (thumbnails?.[preferredKey]) {
    return thumbnails[preferredKey];
  }

  if (thumbnails) {
    const fallbackKey = Object.keys(thumbnails).sort((a, b) => Number(a) - Number(b)).find(Boolean);
    if (fallbackKey && thumbnails[fallbackKey]) {
      return thumbnails[fallbackKey];
    }
  }

  return artist.photoUrl;
}

export function getArtistImageAttribution(artist?: Artist | null): ArtistImageAttribution | undefined {
  if (!artist?.image) {
    return undefined;
  }

  const { credit, license, licenseUrl, source, sourceUrl } = artist.image;
  if (!credit && !license && !source) {
    return undefined;
  }

  return { credit, license, licenseUrl, source, sourceUrl };
}
