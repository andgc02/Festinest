import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Avatar, Card, FilterChip, SearchBar } from '@/components/ui';
import { typographyRN } from '@/constants/theme';
import { Colors } from '@/styles/colors';
import { Spacing } from '@/styles/spacing';
import { useFadeInUp } from '@/hooks/useFadeInUp';
import { fetchArtists } from '@/services/artists';
import { Artist } from '@/types/artist';

export function ArtistListScreen() {
  const router = useRouter();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [query, setQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadArtists = useCallback(async () => {
    setError(null);
    try {
      const results = await fetchArtists();
      setArtists(results);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadArtists();
  }, [loadArtists]);

  const genreChips = useMemo(() => {
    if (!artists.length) {
      return [];
    }
    const unique = new Set<string>();
    artists.forEach((artist) => {
      artist.genres?.forEach((genre) => {
        if (genre) {
          unique.add(genre);
        }
      });
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [artists]);

  const filteredArtists = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return artists.filter((artist) => {
      const matchesQuery =
        !normalizedQuery ||
        artist.name.toLowerCase().includes(normalizedQuery) ||
        (artist.genres ?? []).some((genre) => genre.toLowerCase().includes(normalizedQuery));

      const matchesGenre =
        !selectedGenres.length ||
        (artist.genres ?? []).some((genre) => selectedGenres.includes(genre));

      return matchesQuery && matchesGenre;
    });
  }, [artists, query, selectedGenres]);

  const toggleGenre = useCallback((genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((item) => item !== genre) : [...prev, genre],
    );
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void loadArtists();
  }, [loadArtists]);

  const renderArtist = useCallback(
    ({ item, index }: { item: Artist; index: number }) => (
      <ArtistListItem
        artist={item}
        index={index}
        onPress={() => router.push({ pathname: '/artist/[artistId]', params: { artistId: item.id } })}
      />
    ),
    [router],
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={typographyRN.display}>Discover Artists</Text>

      <View style={{ marginTop: Spacing.sectionGap, gap: 16 }}>
        <SearchBar placeholder="Search artists" value={query} onChangeText={setQuery} />

        {genreChips.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {genreChips.map((genre, index) => (
              <FilterChip
                key={genre}
                label={genre}
                selected={selectedGenres.includes(genre)}
                onPress={() => toggleGenre(genre)}
                animationDelay={index * 50}
              />
            ))}
          </View>
        ) : null}
      </View>

      {error ? (
        <Text style={{ marginTop: 12, color: Colors.error, fontSize: 12, textAlign: 'center' }}>{error}</Text>
      ) : null}

      <FlatList
        data={filteredArtists}
        keyExtractor={(item) => item.id}
        renderItem={renderArtist}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', gap: 8, paddingTop: 80 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: Colors.text }}>No artists found</Text>
            <Text style={{ fontSize: 16, color: '#475569', textAlign: 'center' }}>
              Try searching for a different name or genre.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 16,
  },
  loader: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingTop: 24,
    paddingBottom: 40,
    gap: 16,
  },
});

type ArtistListItemProps = {
  artist: Artist;
  index: number;
  onPress: () => void;
};

function ArtistListItem({ artist, index, onPress }: ArtistListItemProps) {
  const animatedStyle = useFadeInUp({ delay: index * 70 });
  const primaryGenre = artist.genres?.[0];

  return (
    <Animated.View style={animatedStyle}>
      <Pressable accessibilityRole="button" onPress={onPress}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Avatar
            name={artist.name}
            imageUri={artist.photoUrl}
            size={48}
            backgroundColor="#EEF2FF"
            textColor={Colors.primary}
          />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: Colors.text }}>{artist.name}</Text>
            {artist.genres?.length ? (
              <Text style={{ fontSize: 13, color: '#475569' }}>{artist.genres.join(' · ')}</Text>
            ) : (
              <Text style={{ fontSize: 13, color: '#94A3B8' }}>Genres coming soon</Text>
            )}
          </View>
          {primaryGenre ? (
            <View
              style={{
                backgroundColor: '#EEF2FF',
                borderRadius: 9999,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: Colors.primary }}>{primaryGenre}</Text>
            </View>
          ) : null}
        </Card>
      </Pressable>
    </Animated.View>
  );
}
