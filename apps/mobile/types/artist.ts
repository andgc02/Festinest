export type ArtistSocials = {
  spotify?: string;
  instagram?: string;
  soundcloud?: string;
  twitter?: string;
  website?: string;
};

export type ArtistImageThumbnails = Record<string, string>;

export type ArtistImageMeta = {
  source?: string;
  sourceUrl?: string;
  credit?: string;
  license?: string;
  licenseUrl?: string;
  wikidataId?: string;
  fileName?: string;
  thumbnails?: ArtistImageThumbnails;
};

export type Artist = {
  id: string;
  name: string;
  genres?: string[];
  photoUrl?: string;
  image?: ArtistImageMeta;
  socials?: ArtistSocials;
  updatedAt?: string;
};
