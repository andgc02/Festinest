import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";

import { Card, SearchBar } from "@/components/ui";
import { fetchFestivals } from "@/services/festivals";
import { Festival } from "@/types/festival";

export function FestivalListScreen() {
  const router = useRouter();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [query, setQuery] = useState("");
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
      item.startDate && item.endDate ? formatDateRange(item.startDate, item.endDate) : "Dates coming soon";

    return (
      <Pressable
        className="mb-4 active:opacity-90"
        onPress={() => router.push({ pathname: "/festival/[festivalId]", params: { festivalId: item.id } })}>
        <Card className="flex-row items-center gap-4">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
            <Ionicons name="ticket-outline" size={22} color="#5A67D8" />
          </View>
          <View className="flex-1 gap-1">
            <Text className="text-lg font-semibold text-slate-50">{item.name}</Text>
            <Text className="text-sm text-slate-300">{`${item.location} • ${dates}`}</Text>
            <Text className="text-xs font-medium uppercase tracking-wide text-primary/80">
              {item.artistsCount ? `${item.artistsCount} artists` : item.genre ?? "Lineup coming soon"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#64748b" />
        </Card>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-slate-950 px-5 pt-16">
      <Text className="text-3xl font-semibold text-slate-50">Discover Festivals</Text>
      <View className="mt-6 gap-4">
        <SearchBar placeholder="Search festivals" value={query} onChangeText={setQuery} />
        <View className="flex-row gap-3">
          <FilterChip label="Genre" />
          <FilterChip label="Date" />
          <FilterChip label="Location" />
        </View>
      </View>
      {loading ? (
        <View className="flex-1 items-center justify-center">
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
            <View className="items-center gap-2 pt-20">
              <Text className="text-lg font-semibold text-slate-50">No festivals found</Text>
              <Text className="text-center text-sm text-slate-400">
                Try adjusting your filters or check back later.
              </Text>
            </View>
          }
        />
      )}
      {error ? <Text className="mt-3 text-center text-sm text-error">{error}</Text> : null}
    </View>
  );
}

function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Dates coming soon";
  }

  const format = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });

  return `${format.format(start)}–${format.format(end)}`;
}

const styles = StyleSheet.create({
  list: {
    paddingTop: 24,
    paddingBottom: 40,
  },
});

function FilterChip({ label }: { label: string }) {
  return (
    <Pressable className="rounded-full border border-slate-700/70 px-4 py-2 active:bg-slate-800/70">
      <Text className="text-sm font-semibold text-slate-200">{label}</Text>
    </Pressable>
  );
}
