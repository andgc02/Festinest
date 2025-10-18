import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button, Card, FilterChip } from '@/components/ui';
import { typographyRN } from '@/constants/theme';
import { Colors } from '@/styles/colors';
import { Spacing } from '@/styles/spacing';
import { useAuth } from '@/providers/AuthProvider';
import { useSavedFestivals } from '@/providers/SavedFestivalsProvider';
import { fetchFestivals } from '@/services/festivals';
import { Festival } from '@/types/festival';
import { useGenrePreferences } from '@/hooks/useGenrePreferences';

export function SettingsScreen() {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const email = user?.email ?? 'admin@festinest.dev';
  const { savedIds, loading: savedLoading } = useSavedFestivals();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loadingFestivals, setLoadingFestivals] = useState(true);
  const [festivalsError, setFestivalsError] = useState<string | null>(null);
  const { genres: preferredGenres, toggleGenre, loading: preferencesLoading } = useGenrePreferences();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchFestivals();
        setFestivals(data);
      } catch (error) {
        setFestivalsError((error as Error).message);
      } finally {
        setLoadingFestivals(false);
      }
    };

    void load();
  }, []);

  const savedFestivals = useMemo(() => {
    if (!savedIds.size) {
      return [];
    }
    return festivals.filter((festival) => savedIds.has(festival.id));
  }, [festivals, savedIds]);

  const availableGenres = useMemo(() => {
    if (!festivals.length) {
      return [];
    }

    const genreSet = new Set<string>();

    festivals.forEach((festival) => {
      if (Array.isArray(festival.genres) && festival.genres.length) {
        festival.genres.forEach((genre) => {
          if (genre) {
            genreSet.add(genre.trim());
          }
        });
      } else if (festival.genre) {
        festival.genre.split(',').forEach((part) => {
          const trimmed = part.trim();
          if (trimmed) {
            genreSet.add(trimmed);
          }
        });
      }
    });

    return Array.from(genreSet).sort((a, b) => a.localeCompare(b));
  }, [festivals]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      Alert.alert('Logout failed', (error as Error).message);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={typographyRN.heading}>Settings</Text>

      <View style={styles.card}>
        <Text style={typographyRN.subheading}>Profile</Text>
        <ProfileRow label="Name" value="Admin Dev" />
        <ProfileRow label="Email" value={email} />
        <ProfileRow
          label="Preferred Genres"
          value={preferredGenres.length ? preferredGenres.join(', ') : 'Select your favorites below'}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saved Festivals</Text>
        <Text style={styles.sectionSubtitle}>Quick access to the festivals you&rsquo;ve bookmarked.</Text>
        {festivalsError ? <Text style={styles.errorText}>{festivalsError}</Text> : null}
        {loadingFestivals || savedLoading ? (
          <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 16 }} />
        ) : savedFestivals.length ? (
          <View style={styles.savedList}>
            {savedFestivals.map((festival) => (
              <SavedFestivalItem
                key={festival.id}
                festival={festival}
                onPress={() => router.push({ pathname: '/festival/[festivalId]', params: { festivalId: festival.id } })}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No saved festivals yet</Text>
            <Text style={styles.emptyBody}>Browse the festival list and tap &ldquo;Add to My Festivals&rdquo; to save.</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Genre Preferences</Text>
        <Text style={styles.sectionSubtitle}>We&rsquo;ll use these to tailor recommendations and schedules.</Text>
        {preferencesLoading || loadingFestivals ? (
          <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 16 }} />
        ) : availableGenres.length ? (
          <View style={styles.genreChips}>
            {availableGenres.map((genre) => (
              <FilterChip
                key={genre}
                label={genre}
                selected={preferredGenres.includes(genre)}
                onPress={() => toggleGenre(genre)}
              />
            ))}
          </View>
        ) : (
          <Text style={[styles.emptyBody, { marginTop: 16 }]}>Genres will appear once festivals are loaded.</Text>
        )}
      </View>

      <View style={styles.list}>
        {['Notifications', 'Invite Friends'].map((item, index, array) => (
          <TouchableOpacity key={item} style={[styles.listItem, index !== array.length - 1 && styles.listDivider]}>
            <Text style={{ fontSize: 16, color: Colors.text }}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button variant="outline" onPress={handleLogout} style={{ marginTop: 32, marginBottom: 40 }}>
        Logout
      </Button>
    </ScrollView>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={{ fontSize: 14, color: '#64748B' }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.text }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 24,
  },
  card: {
    gap: 16,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    padding: 20,
  },
  section: {
    gap: 12,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    padding: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.text },
  sectionSubtitle: { fontSize: 13, color: '#475569' },
  savedList: { gap: 12 },
  emptyState: {
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    padding: 16,
    gap: 6,
  },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: Colors.text },
  emptyBody: { fontSize: 13, color: '#475569' },
  errorText: { marginTop: 8, fontSize: 12, color: Colors.error },
  genreChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  list: { borderRadius: 24, backgroundColor: Colors.surface },
  listItem: { paddingHorizontal: 20, paddingVertical: 16 },
  listDivider: { borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
});

type SavedFestivalItemProps = {
  festival: Festival;
  onPress: () => void;
};

function SavedFestivalItem({ festival, onPress }: SavedFestivalItemProps) {
  return (
    <TouchableOpacity onPress={onPress} accessibilityRole="button">
      <Card style={{ gap: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text }}>{festival.name}</Text>
        <Text style={{ fontSize: 13, color: '#475569' }}>
          {festival.location} {'\u2022'} {formatDateRange(festival.startDate, festival.endDate)}
        </Text>
        {festival.genre ? (
          <Text style={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, color: Colors.primary }}>
            {festival.genre}
          </Text>
        ) : null}
      </Card>
    </TouchableOpacity>
  );
}

function formatDateRange(startDate: string, endDate: string) {
  if (!startDate || !endDate) {
    return 'Dates coming soon';
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Dates coming soon';
  }

  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
  return `${formatter.format(start)}-${formatter.format(end)}`;
}
