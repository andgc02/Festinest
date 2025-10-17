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

  return artist.genres.join(' · ');
}

