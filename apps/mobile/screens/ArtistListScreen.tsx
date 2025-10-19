import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Avatar, Button, Card, FilterChip, Modal, SearchBar } from '@/components/ui';
import { typographyRN } from '@/constants/theme';
import { Colors } from '@/styles/colors';
import { Spacing } from '@/styles/spacing';
import { useFadeInUp } from '@/hooks/useFadeInUp';
import { fetchArtists } from '@/services/artists';
import { Artist } from '@/types/artist';
import { formatArtistGenres, getArtistImageUrl } from '@/utils/artist';

export function ArtistListScreen() {
  const router = useRouter();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [query, setQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [genreModalVisible, setGenreModalVisible] = useState(false);
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

  const genreOptions = useMemo(() => {
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

  const selectedGenresLabel = useMemo(() => {
    if (!selectedGenres.length) {
      return 'All genres';
    }
    const count = selectedGenres.length;
    return `${count} genre${count > 1 ? 's' : ''} selected`;
  }, [selectedGenres]);

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

  const handleClearGenres = useCallback(() => {
    setSelectedGenres([]);
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

        {genreOptions.length ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Button
              variant="outline"
              style={styles.genreButton}
              onPress={() => setGenreModalVisible(true)}>
              {selectedGenresLabel}
            </Button>
            {selectedGenres.length ? (
              <Pressable onPress={handleClearGenres} accessibilityRole="button">
                <Text style={styles.clearGenresText}>Clear</Text>
              </Pressable>
            ) : null}
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

      <Modal
        visible={genreModalVisible}
        onDismiss={() => setGenreModalVisible(false)}
        title="Filter by Genre"
        description="Select one or more genres to refine the artist list."
        primaryAction={{
          label: 'Apply',
          onPress: () => setGenreModalVisible(false),
        }}
        secondaryAction={{
          label: selectedGenres.length ? 'Clear' : 'Cancel',
          variant: 'outline',
          onPress: () => {
            if (selectedGenres.length) {
              handleClearGenres();
            }
            setGenreModalVisible(false);
          },
        }}>
        <View style={styles.genreChipGrid}>
          {genreOptions.map((genre) => (
            <FilterChip
              key={genre}
              label={genre}
              selected={selectedGenres.includes(genre)}
              onPress={() => toggleGenre(genre)}
            />
          ))}
        </View>
      </Modal>
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
  genreButton: {
    paddingHorizontal: 16,
  },
  clearGenresText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  genreChipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
  const thumbnailUri = getArtistImageUrl(artist, 64);
  const genreLine = formatArtistGenres(artist);

  return (
    <Animated.View style={animatedStyle}>
      <Pressable accessibilityRole="button" onPress={onPress}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Avatar
            name={artist.name}
            imageUri={thumbnailUri}
            size={48}
            backgroundColor="#EEF2FF"
            textColor={Colors.primary}
          />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: Colors.text }}>{artist.name}</Text>
            {genreLine ? (
              <Text style={{ fontSize: 13, color: '#475569' }}>{genreLine}</Text>
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
