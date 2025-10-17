import { useEffect, useMemo, useState } from 'react';

import { fetchArtists } from '@/services/artists';
import { Artist } from '@/types/artist';

type ArtistCatalog = {
  loading: boolean;
  artists: Artist[];
  error: string | null;
  byId: Map<string, Artist>;
};

export function useArtistsCatalog(): ArtistCatalog {
  const [loading, setLoading] = useState(true);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const results = await fetchArtists();
        setArtists(results);
        setError(null);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const byId = useMemo(() => {
    return new Map(artists.map((artist) => [artist.id, artist] as const));
  }, [artists]);

  return { loading, artists, error, byId };
}

