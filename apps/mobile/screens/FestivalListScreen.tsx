import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { fetchFestivals } from '@/services/festivals';
import { Festival } from '@/types/festival';

export function FestivalListScreen() {
  const router = useRouter();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFestivals = useCallback(async () => {
    setError(null);
    try {
      const results = await fetchFestivals();
      setFestivals(results);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadFestivals();
  }, [loadFestivals]);

  const filteredFestivals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return festivals;
    }
    return festivals.filter((festival) => {
      return (
        festival.name.toLowerCase().includes(normalizedQuery) ||
        festival.location.toLowerCase().includes(normalizedQuery) ||
        (festival.genre?.toLowerCase().includes(normalizedQuery) ?? false)
      );
    });
  }, [festivals, query]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void loadFestivals();
  }, [loadFestivals]);

  const renderFestival = ({ item }: { item: Festival }) => {
    const dates =
      item.startDate && item.endDate ? formatDateRange(item.startDate, item.endDate) : 'Dates coming soon';

    return (
      <Pressable
        style={styles.card}
        onPress={() => router.push({ pathname: '/festival/[festivalId]', params: { festivalId: item.id } })}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>🎫</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>{`${item.location} • ${dates}`}</Text>
          <Text style={styles.cardMeta}>
            {item.artistsCount ? `${item.artistsCount} artists` : item.genre ?? 'Lineup coming soon'}
          </Text>
        </View>
        <Text style={styles.cardChevron}>›</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Discover Festivals</Text>
      <View style={styles.filters}>
        <TextInput
          style={styles.search}
          placeholder="Search festivals"
          placeholderTextColor="#6b7280"
          value={query}
          onChangeText={setQuery}
        />
        <View style={styles.filterRow}>
          <Pressable style={styles.filterChip}>
            <Text style={styles.filterText}>Genre</Text>
          </Pressable>
          <Pressable style={styles.filterChip}>
            <Text style={styles.filterText}>Date</Text>
          </Pressable>
        </View>
      </View>
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : (
        <FlatList
          data={filteredFestivals}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={renderFestival}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4f46e5" />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No festivals found</Text>
              <Text style={styles.emptyStateSubtitle}>Try adjusting your filters or check back later.</Text>
            </View>
          }
        />
      )}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Dates coming soon';
  }

  const format = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return `${format.format(start)}–${format.format(end)}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050914',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 24,
  },
  filters: {
    gap: 12,
    marginBottom: 20,
  },
  search: {
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#f1f5f9',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterChip: {
    backgroundColor: '#111827',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterText: {
    color: '#a855f7',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    gap: 12,
    paddingBottom: 40,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
  },
  cardSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
  },
  cardMeta: {
    color: '#a855f7',
    fontSize: 13,
  },
  cardChevron: {
    color: '#475569',
    fontSize: 28,
    fontWeight: '300',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyStateTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyStateSubtitle: {
    color: '#94a3b8',
    textAlign: 'center',
  },
  errorText: {
    color: '#f87171',
    textAlign: 'center',
    marginTop: 12,
  },
});
