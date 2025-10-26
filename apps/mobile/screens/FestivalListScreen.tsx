import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Animated, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Card, FilterChip, SearchBar, Skeleton } from '@/components/ui';
import { typographyRN } from '@/constants/theme';
import { Colors } from '@/styles/colors';
import { Spacing } from '@/styles/spacing';
import { useFadeInUp } from '@/hooks/useFadeInUp';
import { fetchFestivals } from '@/services/festivals';
import { Festival } from '@/types/festival';
import { useSavedFestivals } from '@/providers/SavedFestivalsProvider';

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

  const searchIndex = useMemo(
    () =>
      festivals.map((festival) => ({
        festival,
        haystack: buildFestivalHaystack(festival),
      })),
    [festivals],
  );

  const filteredFestivals = useMemo(() => {
    const tokens = buildQueryTokens(query);

    return searchIndex
      .filter(({ festival, haystack }) => {
        if (tokens.length && !tokens.every((token) => haystack.includes(token))) {
          return false;
        }
        if (activeFilters.includes('genre') && !festivalHasGenreData(festival)) {
          return false;
        }
        if (activeFilters.includes('date') && !festivalHasUpcomingDates(festival)) {
          return false;
        }
        if (activeFilters.includes('location') && !festivalHasConcreteLocation(festival)) {
          return false;
        }
        return true;
      })
      .map((entry) => entry.festival)
      .sort(compareFestivals);
  }, [activeFilters, searchIndex, query]);

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

  const showSkeleton = loading && !refreshing;

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
      {showSkeleton ? (
        <FestivalListSkeleton />
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

function buildFestivalHaystack(festival: Festival) {
  const tokens = new Set<string>();

  const push = (value?: string | null) => {
    if (!value) return;
    const normalized = normalizeText(value);
    if (!normalized) return;
    normalized.split(/\s+/).forEach((segment) => {
      if (segment) {
        tokens.add(segment);
      }
    });
  };

  push(festival.name);
  push(festival.location);
  push(festival.status);
  push(festival.genre);

  festival.genres?.forEach(push);

  const addDateTokens = (input?: string) => {
    if (!input) return;
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) {
      return;
    }
    push(date.toISOString().slice(0, 10));
    push(String(date.getFullYear()));
    push(date.toLocaleString('en-US', { month: 'long' }));
    push(date.toLocaleString('en-US', { month: 'short' }));
  };

  addDateTokens(festival.startDate);
  addDateTokens(festival.endDate);

  if (festival.location) {
    festival.location.split(/[,\-/]/).forEach((segment) => push(segment));
  }

  festival.lineup?.forEach((entry) => {
    push(entry.artistName ?? entry.artist);
    push(entry.stage);
    push(entry.day);
  });

  festival.schedule?.forEach((entry) => {
    push(entry.artistName ?? entry.artist);
    push(entry.stage);
    push(entry.day);
  });

  return Array.from(tokens).join(' ');
}

function buildQueryTokens(rawQuery: string) {
  const normalized = normalizeText(rawQuery);
  if (!normalized) {
    return [];
  }
  return normalized.split(/[\s,]+/).filter(Boolean);
}

function festivalHasGenreData(festival: Festival) {
  return Boolean((festival.genres && festival.genres.length > 0) || festival.genre);
}

function festivalHasUpcomingDates(festival: Festival) {
  const start = festival.startDate ? Date.parse(festival.startDate) : Number.NaN;
  const end = festival.endDate ? Date.parse(festival.endDate) : Number.NaN;
  if (Number.isNaN(start) || Number.isNaN(end)) {
    return false;
  }
  return end >= Date.now();
}

function festivalHasConcreteLocation(festival: Festival) {
  if (!festival.location) {
    return false;
  }
  const normalized = normalizeText(festival.location);
  if (!normalized) {
    return false;
  }
  return !['tba', 'tbd', 'unknown'].some((token) => normalized.includes(token));
}

function compareFestivals(a: Festival, b: Festival) {
  const aTime = getFestivalSortTime(a);
  const bTime = getFestivalSortTime(b);

  if (aTime !== bTime) {
    return aTime - bTime;
  }

  return a.name.localeCompare(b.name);
}

function getFestivalSortTime(festival: Festival) {
  const parsed = festival.startDate ? Date.parse(festival.startDate) : Number.NaN;
  if (Number.isNaN(parsed)) {
    return Number.POSITIVE_INFINITY;
  }
  return parsed;
}

function normalizeText(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  return trimmed
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
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
  const { isSaved, getNickname } = useSavedFestivals();
  const saved = isSaved(item.id);
  const nickname = getNickname(item.id);

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
            {nickname ? (
              <View style={styles.nicknamePill}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#9C4221' }}>{`aka ${nickname}`}</Text>
              </View>
            ) : null}
          </View>
          <View style={{ alignItems: 'center', gap: 8 }}>
            {saved ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E2E8F0', borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 4 }}>
                <Ionicons name="bookmark" size={14} color="#5A67D8" />
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#5A67D8' }}>Saved</Text>
              </View>
            ) : null}
            <Ionicons name="chevron-forward" size={20} color="#475569" />
          </View>
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
  nicknamePill: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#FEF3C7',
  },
});

function FestivalListSkeleton() {
  const placeholders = Array.from({ length: 6 });

  return (
    <View style={[styles.list, { gap: 16 }]}>
      {placeholders.map((_, index) => (
        <Card key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Skeleton width={48} height={48} borderRadius={16} />
          <View style={{ flex: 1, gap: 10 }}>
            <Skeleton height={18} width="70%" />
            <Skeleton height={14} width="55%" />
            <Skeleton height={12} width="40%" />
          </View>
          <View style={{ alignItems: 'flex-end', gap: 8 }}>
            <Skeleton height={24} width={64} borderRadius={9999} />
            <Skeleton height={18} width={18} borderRadius={12} />
          </View>
        </Card>
      ))}
    </View>
  );
}
