export type ArtistSocials = {
  spotify?: string;
  instagram?: string;
  soundcloud?: string;
  twitter?: string;
  website?: string;
};

export type Artist = {
  id: string;
  name: string;
  genres?: string[];
  photoUrl?: string;
  socials?: ArtistSocials;
  updatedAt?: string;
};

