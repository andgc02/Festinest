import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Card, FilterChip, SearchBar } from '@/components/ui';
import { typographyRN } from '@/constants/theme';
import { Colors } from '@/styles/colors';
import { Spacing } from '@/styles/spacing';
import { useFadeInUp } from '@/hooks/useFadeInUp';
import { fetchFestivals } from '@/services/festivals';
import { Festival } from '@/types/festival';

type FilterKey = 'genre' | 'date' | 'location';

const FILTER_OPTIONS: Array<{ key: FilterKey; label: string }> = [
  { key: 'genre', label: 'Genre' },
  { key: 'date', label: 'Date' },
  { key: 'location', label: 'Location' },
];

export function FestivalListScreen() {
  const router = useRouter();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterKey[]>([]);

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

    const base = normalizedQuery
      ? festivals.filter((festival) => {
          return (
            festival.name.toLowerCase().includes(normalizedQuery) ||
            festival.location.toLowerCase().includes(normalizedQuery) ||
            (festival.genre?.toLowerCase().includes(normalizedQuery) ?? false)
          );
        })
      : festivals;

    return base.filter((festival) => {
      if (activeFilters.includes('genre') && !festival.genre) {
        return false;
      }
      if (activeFilters.includes('date') && !(festival.startDate && festival.endDate)) {
        return false;
      }
      if (activeFilters.includes('location') && !festival.location) {
        return false;
      }
      return true;
    });
  }, [activeFilters, festivals, query]);

  const toggleFilter = useCallback((key: FilterKey) => {
    setActiveFilters((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void loadFestivals();
  }, [loadFestivals]);

  const renderFestival = ({ item, index }: { item: Festival; index: number }) => (
    <FestivalListItem
      item={item}
      index={index}
      onPress={() => router.push({ pathname: '/festival/[festivalId]', params: { festivalId: item.id } })}
    />
  );

  return (
    <View style={styles.root}>
      <Text style={typographyRN.display}>Discover Festivals</Text>
      <View style={{ marginTop: Spacing.sectionGap, gap: 16 }}>
        <SearchBar placeholder="Search festivals" value={query} onChangeText={setQuery} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {FILTER_OPTIONS.map((filter, index) => (
            <FilterChip
              key={filter.key}
              label={filter.label}
              selected={activeFilters.includes(filter.key)}
              onPress={() => toggleFilter(filter.key)}
              animationDelay={index * 60}
            />
          ))}
        </View>
      </View>
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#5A67D8" />
        </View>
      ) : (
        <FlatList
          data={filteredFestivals}
          keyExtractor={(item) => item.id}
          renderItem={renderFestival}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#5A67D8" />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', gap: 8, paddingTop: 80 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#1A202C' }}>No festivals found</Text>
              <Text style={{ fontSize: 16, color: '#475569', textAlign: 'center' }}>
                Try adjusting your filters or check back later.
              </Text>
            </View>
          }
        />
      )}
      {error ? (
        <Text style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: '#E53E3E' }}>{error}</Text>
      ) : null}
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

  return `${format.format(start)}-${format.format(end)}`;
}

type FestivalListItemProps = {
  item: Festival;
  index: number;
  onPress: () => void;
};

function FestivalListItem({ item, index, onPress }: FestivalListItemProps) {
  const dates = item.startDate && item.endDate ? formatDateRange(item.startDate, item.endDate) : 'Dates coming soon';
  const animatedStyle = useFadeInUp({ delay: index * 80 });

  return (
    <Animated.View style={[{ marginBottom: 16 }, animatedStyle]}>
      <Pressable accessibilityRole="button" onPress={onPress}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View style={{ height: 48, width: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#E2E8F0' }}>
            <Ionicons name="ticket-outline" size={22} color="#5A67D8" />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: Colors.text }}>{item.name}</Text>
            <Text style={{ fontSize: 14, color: '#475569' }}>{`${item.location} \u2022 ${dates}`}</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, color: '#5A67D8' }}>
              {item.artistsCount ? `${item.artistsCount} artists` : item.genre ?? 'Lineup coming soon'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#475569" />
        </Card>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 16,
  },
  list: {
    paddingTop: 24,
    paddingBottom: 40,
  },
});
