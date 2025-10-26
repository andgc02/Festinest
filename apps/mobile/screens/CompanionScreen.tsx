import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card } from '@/components/ui';
import { Colors } from '@/styles/colors';
import { Spacing } from '@/styles/spacing';
import { useAuth } from '@/providers/AuthProvider';
import { useSavedFestivals } from '@/providers/SavedFestivalsProvider';
import { fetchFestivals } from '@/services/festivals';
import { Festival } from '@/types/festival';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';

export function CompanionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.uid;
  const { isPremium, loading: premiumLoading } = usePremiumStatus(userId);
  const { savedIds, getNickname } = useSavedFestivals();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loadingFestivals, setLoadingFestivals] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const results = await fetchFestivals();
        setFestivals(results);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoadingFestivals(false);
      }
    };

    void load();
  }, []);

  const savedFestivals = useMemo(
    () => festivals.filter((festival) => savedIds.has(festival.id)),
    [festivals, savedIds],
  );

  const activeFestival = useMemo(() => {
    if (!savedFestivals.length) {
      return undefined;
    }
    return [...savedFestivals].sort((a, b) => {
      const aTime = a.startDate ? Date.parse(a.startDate) : Number.POSITIVE_INFINITY;
      const bTime = b.startDate ? Date.parse(b.startDate) : Number.POSITIVE_INFINITY;
      return aTime - bTime;
    })[0];
  }, [savedFestivals]);

  const heroNickname = activeFestival ? getNickname(activeFestival.id) : undefined;

  const handleCTA = (message: string) => {
    Alert.alert('Coming soon', message);
  };

  if (premiumLoading || loadingFestivals) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.loader}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!isPremium) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.loader}>
          <Text style={styles.lockedTitle}>Companion mode is a premium perk</Text>
          <Text style={styles.lockedBody}>
            Start a premium preview to unlock live schedule summaries, group pulses, and quick actions while you&rsquo;re on site.
          </Text>
          <Button style={{ marginTop: 24 }} onPress={() => router.push('/onboarding')}>
            Unlock premium preview
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Companion Mode</Text>
        <Text style={styles.subtitle}>
          Your festival cockpit: saved nicknames, quick actions, and squad updates on one screen.
        </Text>

        {activeFestival ? (
          <Card style={{ gap: 12 }}>
            <Text style={styles.sectionLabel}>Active festival</Text>
            <Text style={styles.heroName}>{activeFestival.name}</Text>
            {heroNickname ? <Text style={styles.heroNickname}>{`aka ${heroNickname}`}</Text> : null}
            <Text style={styles.heroMeta}>
              {activeFestival.location} {'\u2022'} {formatDateRange(activeFestival.startDate, activeFestival.endDate)}
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button style={{ flex: 1 }} onPress={() => handleCTA('Schedule view opens your locked-in plan.')}>
                My schedule
              </Button>
              <Button
                variant="outline"
                style={{ flex: 1 }}
                onPress={() => handleCTA('Map view will deep-link into partner maps soon.')}>
                Festival map
              </Button>
            </View>
          </Card>
        ) : (
          <Card style={{ gap: 8 }}>
            <Text style={styles.sectionLabel}>No saved festivals</Text>
            <Text style={styles.heroMeta}>Save a festival to unlock the live companion view.</Text>
            <Button onPress={() => router.push('/(tabs)/festivals')}>Browse festivals</Button>
          </Card>
        )}

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <QuickStatCard
            icon="people"
            label="Group pulse"
            value={activeFestival ? '3 votes locked' : 'No groups yet'}
            onPress={() => handleCTA('Group pulse shows who has voted and what needs attention.')}
          />
          <QuickStatCard
            icon="walk"
            label="Walk buffer"
            value="12 min cushion"
            onPress={() => handleCTA('Smart walk-time alerts arrive here and via push.')}
          />
        </View>

        <Card style={{ gap: 12 }}>
          <Text style={styles.sectionLabel}>Quick actions</Text>
          <View style={styles.actionList}>
            <ActionRow
              icon="flash"
              title="Lightning poll"
              description="Snap decision on who to see next."
              onPress={() => handleCTA('Lightning polls will start from companion soon.')}
            />
            <ActionRow
              icon="chatbubbles"
              title="Nudge the group"
              description="Ping the squad to lock today&rsquo;s picks."
              onPress={() => handleCTA('Group nudges connect to leader controls.')}
            />
            <ActionRow
              icon="shield-checkmark"
              title="Companion lite"
              description="Share a read-only view with friends."
              onPress={() => handleCTA('Companion lite will generate a share link.')}
            />
          </View>
        </Card>

        {savedFestivals.length ? (
          <Card style={{ gap: 8 }}>
            <Text style={styles.sectionLabel}>Saved nicknames</Text>
            {savedFestivals.map((festival) => {
              const nickname = getNickname(festival.id);
              return (
                <View key={festival.id} style={styles.nicknameRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.text }}>{festival.name}</Text>
                    {nickname ? (
                      <Text style={{ fontSize: 13, color: '#475569' }}>{`aka ${nickname}`}</Text>
                    ) : (
                      <Text style={{ fontSize: 13, color: '#94A3B8' }}>No nickname yet</Text>
                    )}
                  </View>
                  <Text style={styles.nicknameMeta}>{formatDateRange(festival.startDate, festival.endDate)}</Text>
                </View>
              );
            })}
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

type QuickStatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress: () => void;
};

function QuickStatCard({ icon, label, value, onPress }: QuickStatCardProps) {
  return (
    <Card style={styles.quickCard}>
      <View style={styles.quickIcon}>
        <Ionicons name={icon} size={16} color={Colors.primary} />
      </View>
      <Text style={{ fontSize: 13, color: '#475569' }}>{label}</Text>
      <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.text }}>{value}</Text>
      <Button variant="outline" onPress={onPress}>
        Details
      </Button>
    </Card>
  );
}

type ActionRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
};

function ActionRow({ icon, title, description, onPress }: ActionRowProps) {
  return (
    <View style={styles.actionRow}>
      <View style={styles.actionIcon}>
        <Ionicons name={icon} size={16} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.text }}>{title}</Text>
        <Text style={{ fontSize: 13, color: '#475569' }}>{description}</Text>
      </View>
      <Button variant="outline" onPress={onPress}>
        Go
      </Button>
    </View>
  );
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
  return `${formatter.format(start)}-${formatter.format(end)}`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.screenPadding,
  },
  container: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: 40,
    paddingTop: 24,
    gap: 20,
  },
  title: { fontSize: 28, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: 15, color: '#475569' },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.8 },
  heroName: { fontSize: 24, fontWeight: '700', color: Colors.text },
  heroNickname: { fontSize: 16, fontWeight: '600', color: Colors.primary },
  heroMeta: { fontSize: 14, color: '#475569' },
  quickCard: { flex: 1, gap: 8 },
  quickIcon: {
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionList: { gap: 16 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIcon: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nicknameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  nicknameMeta: { fontSize: 12, fontWeight: '600', color: '#475569' },
  lockedTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  lockedBody: { marginTop: 8, fontSize: 14, color: '#475569', textAlign: 'center' },
});
