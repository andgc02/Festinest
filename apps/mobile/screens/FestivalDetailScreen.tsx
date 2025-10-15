import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { fetchFestivalById } from '@/services/festivals';
import { Festival } from '@/types/festival';

export function FestivalDetailScreen() {
  const { festivalId } = useLocalSearchParams<{ festivalId?: string }>();
  const router = useRouter();
  const [festival, setFestival] = useState<Festival | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (!festival) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>{error ?? 'Festival not found.'}</Text>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.secondaryButtonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{festival.name}</Text>
        <Text style={styles.subtitle}>
          📍 {festival.location} • {formatDateRange(festival.startDate, festival.endDate)}
        </Text>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Add to My Festivals</Text>
        </TouchableOpacity>
      </View>

      {festival.lineup?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lineup</Text>
          {festival.lineup.map((entry) => (
            <View key={entry.artist} style={styles.lineupRow}>
              <Text style={styles.lineupEmoji}>🎵</Text>
              <View>
                <Text style={styles.lineupText}>{entry.artist}</Text>
                {entry.time ? (
                  <Text style={styles.lineupMeta}>
                    {entry.time} {entry.stage ? `• ${entry.stage}` : ''}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push({ pathname: '/schedule-builder', params: { festivalId: festival.id } })}>
          <Text style={styles.secondaryButtonText}>View Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push({ pathname: '/group/[groupId]', params: { groupId: `${festival.id}-group` } })}>
          <Text style={styles.secondaryButtonText}>Join Group</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    padding: 24,
    backgroundColor: '#050914',
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
  errorText: {
    color: '#f87171',
    fontSize: 16,
  },
  header: {
    gap: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#f8fafc',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#22d3ee',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  primaryButtonText: {
    color: '#0f172a',
    fontWeight: '600',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: '#f1f5f9',
    fontSize: 20,
    fontWeight: '600',
  },
  lineupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#0f172a',
    borderRadius: 12,
  },
  lineupEmoji: {
    fontSize: 20,
  },
  lineupText: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '600',
  },
  lineupMeta: {
    color: '#94a3b8',
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1e1b4b',
  },
  secondaryButtonText: {
    color: '#a855f7',
    textAlign: 'center',
    fontWeight: '600',
  },
});
