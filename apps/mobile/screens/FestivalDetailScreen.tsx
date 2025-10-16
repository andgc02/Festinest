import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, FilterChip, Modal, Toast } from '@/components/ui';
import { typography } from '@/constants/theme';
import { fetchFestivalById } from '@/services/festivals';
import { Festival, FestivalLineupEntry } from '@/types/festival';

export function FestivalDetailScreen() {
  const { festivalId } = useLocalSearchParams<{ festivalId?: string }>();
  const router = useRouter();
  const [festival, setFestival] = useState<Festival | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [groupModalVisible, setGroupModalVisible] = useState(false);

  useEffect(() => {
    if (!festivalId) {
      setError('Festival not found.');
      setLoading(false);
      return;
    }

    const loadFestival = async () => {
      try {
        const result = await fetchFestivalById(festivalId);
        setFestival(result);
        if (!result) {
          setError('Festival not found.');
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    void loadFestival();
  }, [festivalId]);

  const lineupEntries: FestivalLineupEntry[] = useMemo(() => festival?.lineup ?? [], [festival]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#5A67D8" />
      </View>
    );
  }

  if (!festival) {
    return (
      <View style={styles.loader}>
        <Text className="text-base text-error">{error ?? 'Festival not found.'}</Text>
        <Button variant="outline" className="mt-6 w-48" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  const handleSave = () => {
    setToastVisible(true);
  };

  const handleJoinGroup = () => {
    setGroupModalVisible(true);
  };

  return (
    <View className="flex-1 bg-slate-950" style={styles.root}>
      <ScrollView contentContainerStyle={styles.container}>
        <View className="gap-6">
          <View className="gap-4">
            <Text className={typography.heading}>{festival.name}</Text>
            <Text className={typography.body}>
              {festival.location} {'\u2022'} {formatDateRange(festival.startDate, festival.endDate)}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {festival.genre ? <FilterChip label={festival.genre} selected /> : null}
              {festival.artistsCount ? (
                <FilterChip label={`${festival.artistsCount} artists`} />
              ) : null}
              {/* priceRange not present in type; omit for now */}
            </View>
            <Button onPress={handleSave} className="w-full">
              Add to My Festivals
            </Button>
          </View>

          {/* description not present in type; omit for now */}

          {lineupEntries.length ? (
            <View className="gap-4">
              <Text className={typography.subheading}>Lineup</Text>
              <View className="gap-2 rounded-2xl bg-slate-900/70 p-4">
                {lineupEntries.map((entry) => (
                  <View
                    key={`${entry.artist}-${entry.stage ?? 'stage'}`}
                    className="flex-row items-center justify-between rounded-xl border border-slate-800/60 px-3 py-2">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-slate-100">{entry.artist}</Text>
                      <Text className="text-xs text-slate-400">
                        {entry.time ?? 'Time TBA'}
                        {entry.stage ? ` \u2022 ${entry.stage}` : ''}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>

        <View className="mt-8 flex-row gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onPress={() => router.push({ pathname: '/schedule-builder', params: { festivalId: festival.id } })}>
            View Schedule
          </Button>
          <Button variant="outline" className="flex-1" onPress={handleJoinGroup}>
            Join Group
          </Button>
        </View>
      </ScrollView>

      <Toast
        visible={toastVisible}
        message={`${festival.name} added to your saved festivals.`}
        type="success"
        onHide={() => setToastVisible(false)}
      />

      <Modal
        visible={groupModalVisible}
        onDismiss={() => setGroupModalVisible(false)}
        title="Join Festival Group"
        description="Collaborate on schedules, vote on sets, and sync plans with your crew."
        primaryAction={{
          label: 'Open Group',
          onPress: () => {
            setGroupModalVisible(false);
            router.push({ pathname: '/group/[groupId]', params: { groupId: `${festival.id}-group` } });
          },
        }}
        secondaryAction={{
          label: 'Not now',
          variant: 'outline',
          onPress: () => setGroupModalVisible(false),
        }}>
        <View className="gap-3">
          <Text className={typography.body}>Coming soon: chat previews, votes, and shared schedules.</Text>
        </View>
      </Modal>
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050914',
  },
  container: {
    padding: 24,
    paddingBottom: 120,
    gap: 24,
  },
  loader: {
    flex: 1,
    backgroundColor: '#050914',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
});
