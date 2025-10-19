import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card } from '@/components/ui';
import { typographyRN } from '@/constants/theme';
import { Colors } from '@/styles/colors';
import { Spacing } from '@/styles/spacing';
import { fetchArtistById } from '@/services/artists';
import { fetchFestivals } from '@/services/festivals';
import { Artist } from '@/types/artist';
import { Festival, FestivalLineupEntry, FestivalScheduleEntry } from '@/types/festival';
import {
  formatArtistGenres,
  getArtistImageAttribution,
  getArtistImageUrl,
  getArtistSocialLinks,
  type ArtistImageAttribution,
} from '@/utils/artist';

type ArtistAppearance = {
  festival: Festival;
  slots: Array<{
    stage?: string;
    day?: string;
    time?: string;
  }>;
};

export function ArtistDetailScreen() {
  const { artistId } = useLocalSearchParams<{ artistId?: string }>();
  const router = useRouter();
  const [artist, setArtist] = useState<Artist | undefined>();
  const [appearances, setAppearances] = useState<ArtistAppearance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!artistId) {
        setError('Artist not found.');
        setLoading(false);
        return;
      }

      try {
        const [artistData, festivals] = await Promise.all([
          fetchArtistById(artistId),
          fetchFestivals(),
        ]);

        if (!artistData) {
          setError('Artist not found.');
          setArtist(undefined);
          setAppearances([]);
          return;
        }

        setArtist(artistData);
        setAppearances(mapAppearances(artistData, festivals));
        setError(null);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [artistId]);

  const heroImageUri = useMemo(() => getArtistImageUrl(artist, 256), [artist]);
  const imageAttribution = useMemo<ArtistImageAttribution | undefined>(
    () => getArtistImageAttribution(artist),
    [artist],
  );
  const genreLine = useMemo(() => formatArtistGenres(artist), [artist]);
  const socialLinks = useMemo(() => getArtistSocialLinks(artist), [artist]);

  const safeAreaEdges = ['top', 'bottom'] as const;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={safeAreaEdges}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!artist) {
    return (
      <SafeAreaView style={styles.safeArea} edges={safeAreaEdges}>
        <View style={[styles.centered, { paddingHorizontal: 24 }]}>
          <Text style={{ fontSize: 16, color: Colors.error }}>{error ?? 'Artist not found.'}</Text>
          <Button variant="outline" style={{ marginTop: 24, width: 200 }} onPress={() => router.back()}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={safeAreaEdges}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={{ gap: 20 }}>
          <View style={styles.header}>
            {heroImageUri ? (
              <Image
                source={{ uri: heroImageUri }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.heroPlaceholder}>
                <Text style={{ fontSize: 32, fontWeight: '700', color: Colors.primary }}>
                  {artist.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={{ gap: 8 }}>
              <Text style={typographyRN.heading}>{artist.name}</Text>
              {genreLine ? (
                <Text style={{ fontSize: 14, color: '#475569' }}>{genreLine}</Text>
              ) : null}
            </View>
          </View>

          {heroImageUri && imageAttribution ? (
            <View style={styles.attribution}>
              <Text style={styles.attributionText}>
                Photo: {imageAttribution.credit ?? 'Unknown photographer'}
              </Text>
              {imageAttribution.license ? (
                <Text style={styles.attributionText}>
                  License:{' '}
                  {imageAttribution.licenseUrl ? (
                    <Text
                      style={styles.attributionLink}
                      accessibilityRole="link"
                      onPress={() => openLink(imageAttribution.licenseUrl ?? '')}>
                      {imageAttribution.license}
                    </Text>
                  ) : (
                    imageAttribution.license
                  )}
                </Text>
              ) : null}
              {imageAttribution.source ? (
                <Text style={styles.attributionText}>
                  Source:{' '}
                  {imageAttribution.sourceUrl ? (
                    <Text
                      style={styles.attributionLink}
                      accessibilityRole="link"
                      onPress={() => openLink(imageAttribution.sourceUrl ?? '')}>
                      {imageAttribution.source}
                    </Text>
                  ) : (
                    imageAttribution.source
                  )}
                </Text>
              ) : null}
            </View>
           ) : null}


          {socialLinks.length ? (
            <View style={{ gap: 12 }}>
              <Text style={typographyRN.subheading}>Connect</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {socialLinks.map((social) => (
                  <Pressable
                    key={social.key}
                    onPress={() => openLink(social.url)}
                    style={styles.socialPill}
                    accessibilityRole="link"
                    accessibilityLabel={`Open ${artist.name} on ${social.label}`}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.primary }}>
                      {social.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          <View style={{ gap: 12 }}>
            <Text style={typographyRN.subheading}>Festival Appearances</Text>
            {appearances.length ? (
              <View style={{ gap: 12 }}>
                {appearances.map((appearance) => (
                  <Pressable
                    key={appearance.festival.id}
                    onPress={() =>
                      router.push({
                        pathname: '/festival/[festivalId]',
                        params: { festivalId: appearance.festival.id },
                      })
                    }
                    accessibilityRole="button">
                    <Card style={{ gap: 12 }}>
                      <View style={{ gap: 4 }}>
                        <Text style={{ fontSize: 17, fontWeight: '600', color: Colors.text }}>
                          {appearance.festival.name}
                        </Text>
                        <Text style={{ fontSize: 13, color: '#64748B' }}>
                          {formatFestivalSubtitle(appearance.festival)}
                        </Text>
                      </View>

                      <View style={{ gap: 8 }}>
                        {appearance.slots.map((slot, index) => (
                          <View
                            key={`${slot.day ?? 'day'}-${slot.stage ?? 'stage'}-${slot.time ?? index}`}
                            style={styles.slotRow}>
                            <Text style={styles.slotDay}>{slot.day ?? 'Day TBA'}</Text>
                            <Text style={styles.slotDetail}>
                              {slot.time ?? 'Time TBA'}
                              {slot.stage ? ` @ ${slot.stage}` : ''}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </Card>
                  </Pressable>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No festival appearances yet</Text>
                <Text style={styles.emptyBody}>
                  Check back once booking announcements include {artist.name}.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function mapAppearances(artist: Artist, festivals: Festival[]): ArtistAppearance[] {
  const normalizedId = artist.id.toLowerCase();
  const normalizedName = artist.name.toLowerCase();

  return festivals.reduce<ArtistAppearance[]>((list, festival) => {
    const slots = new Map<string, { stage?: string; day?: string; time?: string }>();

    const lineupMatches = (festival.lineup ?? []).filter((entry) =>
      matchesArtist(entry, normalizedId, normalizedName),
    );
    lineupMatches.forEach((entry) => {
      const key = serializeSlot(entry.day, entry.stage, entry.time);
      if (!slots.has(key)) {
        slots.set(key, {
          day: entry.day,
          stage: entry.stage,
          time: entry.time,
        });
      }
    });

    const scheduleMatches = (festival.schedule ?? []).filter((entry) =>
      matchesArtist(entry, normalizedId, normalizedName),
    );
    scheduleMatches.forEach((entry) => {
      const key = serializeSlot(entry.day, entry.stage, entry.time);
      if (!slots.has(key)) {
        slots.set(key, {
          day: entry.day,
          stage: entry.stage,
          time: entry.time,
        });
      }
    });

    if (slots.size) {
      list.push({
        festival,
        slots: Array.from(slots.values()),
      });
    }

    return list;
  }, []);
}

function matchesArtist(
  entry: FestivalLineupEntry | FestivalScheduleEntry,
  normalizedId: string,
  normalizedName: string,
) {
  const candidateIds = [
    (entry as FestivalLineupEntry).artistId,
    (entry as FestivalScheduleEntry).artistId,
  ]
    .filter(Boolean)
    .map((value) => value!.toLowerCase());

  if (candidateIds.includes(normalizedId)) {
    return true;
  }

  const candidateNames = [
    (entry as FestivalLineupEntry).artist,
    (entry as FestivalLineupEntry).artistName,
    (entry as FestivalScheduleEntry).artist,
    (entry as FestivalScheduleEntry).artistName,
  ]
    .filter(Boolean)
    .map((value) => value!.toLowerCase());

  return candidateNames.includes(normalizedName);
}

function serializeSlot(day?: string, stage?: string, time?: string) {
  return `${day ?? ''}|${stage ?? ''}|${time ?? ''}`;
}

function formatFestivalSubtitle(festival: Festival) {
  const range = formatDateRange(festival.startDate, festival.endDate);
  return festival.location ? `${festival.location} • ${range}` : range;
}

function formatDateRange(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) {
    return 'Dates coming soon';
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Dates coming soon';
  }

  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function openLink(url: string) {
  Linking.openURL(url).catch((err) => {
    console.warn('Failed to open url', err);
  });
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 16,
    paddingBottom: 48,
    gap: 24,
  },
  centered: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  heroImage: {
    width: 96,
    height: 96,
    borderRadius: 24,
  },
  heroPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialPill: {
    borderRadius: 9999,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  attribution: {
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  attributionText: {
    fontSize: 12,
    color: '#475569',
  },
  attributionLink: {
    fontSize: 12,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  slotDay: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  slotDetail: {
    fontSize: 13,
    color: '#475569',
  },
  emptyState: {
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    padding: 16,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  emptyBody: {
    fontSize: 13,
    color: '#475569',
  },
});







