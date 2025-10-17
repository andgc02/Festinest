import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, FilterChip, Modal, Toast } from '@/components/ui';
import { typographyRN } from '@/constants/theme';
import { Colors } from '@/styles/colors';
import { Spacing } from '@/styles/spacing';
import { fetchFestivalById } from '@/services/festivals';
import { Festival, FestivalLineupEntry } from '@/types/festival';
import { useSavedFestivals } from '@/providers/SavedFestivalsProvider';

export function FestivalDetailScreen() {
  const { festivalId } = useLocalSearchParams<{ festivalId?: string }>();
  const router = useRouter();
  const [festival, setFestival] = useState<Festival | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const { isSaved, toggle, loading: savedLoading } = useSavedFestivals();

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
  const lineupSections = useMemo(() => groupLineup(lineupEntries), [lineupEntries]);
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    if (lineupSections.length) {
      setOpenSection(lineupSections[0].key);
    } else {
      setOpenSection(null);
    }
  }, [lineupSections]);

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

  const saved = isSaved(festival.id);

  const handleSaveToggle = () => {
    const nextSaved = !saved;
    toggle(festival.id);
    setToastMessage(
      nextSaved
        ? `${festival.name} added to your saved festivals.`
        : `${festival.name} removed from your saved festivals.`,
    );
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
              {festival.artistsCount ? <FilterChip label={`${festival.artistsCount} artists`} /> : null}
            </View>
            <Button onPress={handleSaveToggle} style={{ width: '100%' }} disabled={savedLoading}>
              {saved ? 'Remove from My Festivals' : 'Add to My Festivals'}
            </Button>
          </View>

          {/* description not present in type; omit for now */}

          {lineupSections.length ? (
            <View style={{ gap: 16 }}>
              <Text style={typographyRN.subheading}>Lineup</Text>
              <View style={{ borderRadius: 16, backgroundColor: '#FFFFFF', padding: 8 }}>
                {lineupSections.map((section) => (
                  <LineupAccordionSection
                    key={section.key}
                    section={section}
                    expanded={openSection === section.key}
                    onToggle={() => setOpenSection((prev) => (prev === section.key ? null : section.key))}
                  />
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

      <Toast visible={toastVisible} message={toastMessage} type="success" onHide={() => setToastVisible(false)} />

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

type LineupSection = {
  key: string;
  title: string;
  entries: FestivalLineupEntry[];
};

function groupLineup(entries: FestivalLineupEntry[]): LineupSection[] {
  if (!entries.length) {
    return [];
  }

  const map = new Map<string, FestivalLineupEntry[]>();
  entries.forEach((entry) => {
    const raw = (entry.stage ?? 'Stage TBA').trim();
    const key = raw.length ? raw : 'Stage TBA';
    const list = map.get(key) ?? [];
    list.push(entry);
    map.set(key, list);
  });

  return Array.from(map.entries()).map(([title, grouped]) => ({
    key: title,
    title,
    entries: grouped,
  }));
}

type LineupAccordionSectionProps = {
  section: LineupSection;
  expanded: boolean;
  onToggle: () => void;
};

function LineupAccordionSection({ section, expanded, onToggle }: LineupAccordionSectionProps) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Pressable
        accessibilityRole="button"
        onPress={onToggle}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: expanded ? '#EEF2FF' : '#FFFFFF',
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderWidth: 1,
          borderColor: expanded ? '#C7D2FE' : '#E2E8F0',
        }}>
        <View>
          <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.text }}>{section.title}</Text>
          <Text style={{ fontSize: 12, color: '#475569' }}>{`${section.entries.length} set${section.entries.length !== 1 ? 's' : ''}`}</Text>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color="#475569" />
      </Pressable>
      {expanded ? (
        <View
          style={{
            gap: 8,
            paddingHorizontal: 16,
            paddingBottom: 16,
            paddingTop: 12,
            backgroundColor: '#FFFFFF',
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            borderWidth: 1,
            borderTopWidth: 0,
            borderColor: '#E2E8F0',
          }}>
          {section.entries.map((entry) => (
            <View
              key={`${entry.artist}-${entry.time ?? 'time'}`}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.text }}>{entry.artist}</Text>
                <Text style={{ fontSize: 12, color: '#475569' }}>
                  {entry.time ?? 'Time TBA'}
                  {entry.stage ? ` \u2022 ${entry.stage}` : ''}
                </Text>
              </View>
            </View>
          ))}
        </View>
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: Spacing.sectionGap,
    paddingBottom: 120,
    gap: 24,
  },
  loader: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
});
