import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MOCK_LINEUP = ['Billie Eilish', 'Fred again..', 'Tame Impala', 'Peggy Gou', 'Kaytranada'];

export function FestivalDetailScreen() {
  const { festivalId } = useLocalSearchParams<{ festivalId?: string }>();
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{festivalId ?? 'Festival'}</Text>
        <Text style={styles.subtitle}>📍 Indio, CA • Apr 11–13</Text>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Add to My Festivals</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lineup</Text>
        {MOCK_LINEUP.map((artist) => (
          <View key={artist} style={styles.lineupRow}>
            <Text style={styles.lineupEmoji}>🎵</Text>
            <Text style={styles.lineupText}>{artist}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/schedule-builder')}>
          <Text style={styles.secondaryButtonText}>View Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/group/coachella-squad')}>
          <Text style={styles.secondaryButtonText}>Join Group</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#050914',
    gap: 24,
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
