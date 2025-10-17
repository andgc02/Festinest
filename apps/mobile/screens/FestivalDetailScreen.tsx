import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, FilterChip, Modal, Toast } from '@/components/ui';
import { typographyRN } from '@/constants/theme';
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
        <Text style={{ fontSize: 16, color: '#E53E3E' }}>{error ?? 'Festival not found.'}</Text>
        <Button variant="outline" style={{ marginTop: 24, width: 192 }} onPress={() => router.back()}>
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
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={{ gap: 24 }}>
          <View style={{ gap: 16 }}>
            <Text style={typographyRN.heading}>{festival.name}</Text>
            <Text style={typographyRN.body}>
              {festival.location} {'\u2022'} {formatDateRange(festival.startDate, festival.endDate)}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {festival.genre ? <FilterChip label={festival.genre} selected /> : null}
              {festival.artistsCount ? (
                <FilterChip label={`${festival.artistsCount} artists`} />
              ) : null}
              {/* priceRange not present in type; omit for now */}
            </View>
            <Button onPress={handleSave} style={{ width: '100%' }}>
              Add to My Festivals
            </Button>
          </View>

          {/* description not present in type; omit for now */}

          {lineupEntries.length ? (
            <View style={{ gap: 16 }}>
              <Text style={typographyRN.subheading}>Lineup</Text>
              <View style={{ gap: 8, borderRadius: 16, backgroundColor: 'rgba(15,23,42,0.70)', padding: 16 }}>
                {lineupEntries.map((entry) => (
                  <View
                    key={`${entry.artist}-${entry.stage ?? 'stage'}`}
                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(30,41,59,0.60)', paddingHorizontal: 12, paddingVertical: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#F1F5F9' }}>{entry.artist}</Text>
                      <Text style={{ fontSize: 12, color: '#94A3B8' }}>
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

        <View style={{ marginTop: 32, flexDirection: 'row', gap: 12 }}>
          <Button
            variant="secondary"
            style={{ flex: 1 }}
            onPress={() => router.push({ pathname: '/schedule-builder', params: { festivalId: festival.id } })}>
            View Schedule
          </Button>
          <Button variant="outline" style={{ flex: 1 }} onPress={handleJoinGroup}>
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
        <View style={{ gap: 12 }}>
          <Text style={typographyRN.body}>Coming soon: chat previews, votes, and shared schedules.</Text>
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
