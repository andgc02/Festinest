import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import { Avatar, Button, Card, FilterChip } from '@/components/ui';
import { typographyRN } from '@/constants/theme';
import { Colors } from '@/styles/colors';
import { Spacing } from '@/styles/spacing';
import { useAuth } from '@/providers/AuthProvider';
import { useSavedFestivals } from '@/providers/SavedFestivalsProvider';
import { fetchFestivals } from '@/services/festivals';
import { Festival } from '@/types/festival';
import { useGenrePreferences } from '@/hooks/useGenrePreferences';
import { useProfileDetails } from '@/hooks/useProfileDetails';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { FestivalNicknameModal } from '@/components/FestivalNicknameModal';

const PRIVACY_VISIBILITY_OPTIONS = [
  { value: 'public' as const, label: 'Public badges' },
  { value: 'friends' as const, label: 'Friends only' },
  { value: 'private' as const, label: 'Private only' },
];

export function SettingsScreen() {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const email = user?.email ?? 'you@example.com';
  const { savedIds, loading: savedLoading, getNickname, updateNickname } = useSavedFestivals();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loadingFestivals, setLoadingFestivals] = useState(true);
  const [festivalsError, setFestivalsError] = useState<string | null>(null);
  const { genres: preferredGenres, toggleGenre, loading: preferencesLoading } = useGenrePreferences();
  const { profile, loading: profileLoading } = useProfileDetails();
  const {
    preferences: notificationPreferences,
    loading: notificationLoading,
    syncing: notificationSyncing,
    permissionStatus: notificationPermissionStatus,
    ensurePermissions: ensureNotificationPermissions,
    togglePreference: updateNotificationPreference,
    error: notificationError,
  } = useNotificationPreferences({ userId: user?.uid ?? undefined });
  const {
    settings: privacySettings,
    loading: privacyLoading,
    requesting: privacyRequesting,
    updateSetting: updatePrivacySetting,
    exportData,
    deleteData,
    error: privacyError,
  } = usePrivacySettings(user?.uid ?? undefined);
  const { isPremium, loading: premiumStatusLoading } = usePremiumStatus(user?.uid ?? undefined);
  const notificationPermissionGranted = notificationPermissionStatus === 'granted';
  const [nicknameTarget, setNicknameTarget] = useState<Festival | null>(null);
  const [nicknameSaving, setNicknameSaving] = useState(false);

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

  const handleNicknameSave = async (value: string) => {
    if (!nicknameTarget) {
      return;
    }
    setNicknameSaving(true);
    try {
      await updateNickname(nicknameTarget.id, value);
      setNicknameTarget(null);
    } catch (error) {
      Alert.alert('Nickname update failed', (error as Error).message);
    } finally {
      setNicknameSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const requestId = await exportData();
      Alert.alert('Export requested', `We queued your export. Reference: ${requestId}.`);
    } catch (error) {
      Alert.alert('Export failed', (error as Error).message);
    }
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Request data deletion',
      'We will remove stored data after a short verification window. You will receive an email when the request is fulfilled.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                const requestId = await deleteData();
                Alert.alert('Request received', `We logged your deletion request (${requestId}).`);
              } catch (error) {
                Alert.alert('Delete request failed', (error as Error).message);
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={typographyRN.heading}>Settings</Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={typographyRN.subheading}>Profile</Text>
          <TouchableOpacity
            onPress={() => router.push('/profile/edit')}
            accessibilityRole="button"
            style={styles.editLinkWrapper}>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.profileAvatarRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileAvatarName}>{profile.displayName || 'Festival Fan'}</Text>
            <Text style={styles.profileAvatarHint}>Visible across your groups and schedule.</Text>
          </View>
          <Avatar name={profile.displayName} imageUri={profile.avatarUri} size={56} />
        </View>
        <ProfileRow
          label="Name"
          value={profile.displayName}
          placeholder="Add your name"
          loading={profileLoading}
        />
        <ProfileRow label="Email" value={email} />
        <ProfileRow
          label="Home Base"
          value={profile.homeBase}
          placeholder="Add your city"
          loading={profileLoading}
        />
        <ProfileRow
          label="Preferred Genres"
          value={preferredGenres.length ? preferredGenres.join(', ') : ''}
          placeholder="Select your favourites below"
          loading={preferencesLoading || loadingFestivals}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Text style={styles.sectionSubtitle}>Choose how Festinest keeps you in the loop.</Text>
        {notificationError ? <Text style={styles.errorText}>{notificationError}</Text> : null}
        <View style={styles.preferenceList}>
          <NotificationPreferenceRow
            label="Group activity"
            description="Mentions, new chat replies, and fresh invites."
            value={notificationPreferences.groupActivity}
            onValueChange={(value) => void updateNotificationPreference('groupActivity', value)}
            disabled={notificationLoading || notificationSyncing}
          />
          <NotificationPreferenceRow
            label="Schedule updates"
            description="Conflicts, votes closing soon, and lineup nudges."
            value={notificationPreferences.scheduleUpdates}
            onValueChange={(value) => void updateNotificationPreference('scheduleUpdates', value)}
            disabled={notificationLoading || notificationSyncing}
          />
          <NotificationPreferenceRow
            label="Premium alerts"
            description="Lightning polls, leader controls, and perks worth sharing."
            value={notificationPreferences.premiumAlerts}
            onValueChange={(value) => void updateNotificationPreference('premiumAlerts', value)}
            disabled={notificationLoading || notificationSyncing}
          />
      </View>
        <Button
          variant={notificationPermissionGranted ? 'outline' : 'primary'}
          onPress={() => void ensureNotificationPermissions()}
          loading={notificationLoading}
        >
          {notificationPermissionGranted ? 'Refresh push registration' : 'Enable push notifications'}
        </Button>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Data</Text>
        <Text style={styles.sectionSubtitle}>Choose who can view your badges and manage your data rights.</Text>
        {privacyError ? <Text style={styles.errorText}>{privacyError}</Text> : null}
        {privacyLoading ? <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 8 }} /> : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {PRIVACY_VISIBILITY_OPTIONS.map((option) => (
            <FilterChip
              key={option.value}
              label={option.label}
              selected={privacySettings.profileVisibility === option.value}
              onPress={() => void updatePrivacySetting('profileVisibility', option.value)}
              disabled={privacyLoading}
              disableAnimation
            />
          ))}
        </View>
        <View style={styles.preferenceList}>
          <NotificationPreferenceRow
            label="Share anonymized trends"
            description="Help us surface better recommendations by sharing obfuscated usage signals."
            value={privacySettings.dataSharing}
            onValueChange={(value) => void updatePrivacySetting('dataSharing', value)}
            disabled={privacyLoading}
          />
          <NotificationPreferenceRow
            label="Personalized tips"
            description="Use your saved festivals and nicknames for smarter schedule nudges."
            value={privacySettings.personalizedTips}
            onValueChange={(value) => void updatePrivacySetting('personalizedTips', value)}
            disabled={privacyLoading}
          />
        </View>
        <View style={{ gap: 12 }}>
          <Button variant="outline" onPress={handleExportData} loading={privacyRequesting} disabled={privacyLoading}>
            Request data export
          </Button>
          <Button variant="secondary" onPress={handleDeleteData} loading={privacyRequesting} disabled={privacyLoading}>
            Request data deletion
          </Button>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Companion Mode (Premium)</Text>
        <Text style={styles.sectionSubtitle}>
          {isPremium
            ? 'Launch the live dashboard for saved nicknames, group pulses, and walk-time alerts.'
            : 'Start a premium preview to unlock the live companion dashboard for festival days.'}
        </Text>
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Ionicons name="sparkles" size={14} color={Colors.primary} />
            <Text style={{ fontSize: 13, color: '#475569' }}>Live schedule digest with nickname badges</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Ionicons name="chatbubble" size={14} color={Colors.primary} />
            <Text style={{ fontSize: 13, color: '#475569' }}>Group pulse + lightning polls from one place</Text>
          </View>
        </View>
        <Button
          style={{ marginTop: 12 }}
          variant={isPremium ? 'primary' : 'secondary'}
          onPress={() => (isPremium ? router.push('/companion') : router.push('/onboarding'))}
          loading={premiumStatusLoading}>
          {isPremium ? 'Launch Companion Mode' : 'Start premium preview'}
        </Button>
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
                nickname={getNickname(festival.id)}
                onPress={() => router.push({ pathname: '/festival/[festivalId]', params: { festivalId: festival.id } })}
                onNicknamePress={() => setNicknameTarget(festival)}
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
        {['Invite Friends', 'Help & Support'].map((item, index, array) => (
          <TouchableOpacity key={item} style={[styles.listItem, index !== array.length - 1 && styles.listDivider]}>
            <Text style={{ fontSize: 16, color: Colors.text }}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button variant="outline" onPress={handleLogout} style={{ marginTop: 32, marginBottom: 40 }}>
        Logout
      </Button>
      <FestivalNicknameModal
        visible={Boolean(nicknameTarget)}
        festivalName={nicknameTarget?.name ?? ''}
        initialNickname={nicknameTarget ? getNickname(nicknameTarget.id) : undefined}
        saving={nicknameSaving}
        onSave={(value) => handleNicknameSave(value)}
        onDismiss={() => setNicknameTarget(null)}
      />
    </ScrollView>
  );
}

function ProfileRow({
  label,
  value,
  placeholder = '—',
  loading = false,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  loading?: boolean;
}) {
  const displayValue = loading ? 'Loading…' : value?.trim().length ? value : placeholder;
  const isPlaceholder = !loading && (!value || !value.trim().length);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={{ fontSize: 14, color: '#64748B' }}>{label}</Text>
      <Text
        style={[
          { fontSize: 14, fontWeight: '600', color: Colors.text },
          isPlaceholder && styles.placeholderText,
        ]}>
        {displayValue}
      </Text>
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editLinkWrapper: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  editLink: { fontSize: 13, fontWeight: '600', color: '#5A67D8' },
  section: {
    gap: 12,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    padding: 20,
  },
  profileAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 4,
  },
  profileAvatarName: { fontSize: 16, fontWeight: '600', color: Colors.text },
  profileAvatarHint: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.text },
  sectionSubtitle: { fontSize: 13, color: '#475569' },
  preferenceList: { gap: 16, marginTop: 8 },
  preferenceRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
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
  placeholderText: { color: '#94A3B8', fontWeight: '500' },
});

type SavedFestivalItemProps = {
  festival: Festival;
  nickname?: string;
  onPress: () => void;
  onNicknamePress: () => void;
};

function SavedFestivalItem({ festival, nickname, onPress, onNicknamePress }: SavedFestivalItemProps) {
  return (
    <TouchableOpacity onPress={onPress} accessibilityRole="button">
      <Card style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text }}>{festival.name}</Text>
            {nickname ? <Text style={{ fontSize: 13, color: Colors.primary, fontWeight: '600' }}>{`aka ${nickname}`}</Text> : null}
          </View>
          <Pressable onPress={(event) => { event.stopPropagation(); onNicknamePress(); }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#5A67D8' }}>{nickname ? 'Edit' : 'Add name'}</Text>
          </Pressable>
        </View>
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
type NotificationPreferenceRowProps = {
  label: string;
  description: string;
  value: boolean;
  disabled?: boolean;
  onValueChange: (value: boolean) => void;
};

function NotificationPreferenceRow({ label, description, value, disabled, onValueChange }: NotificationPreferenceRowProps) {
  return (
    <View style={styles.preferenceRow}>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.text }}>{label}</Text>
        <Text style={{ fontSize: 13, color: '#475569' }}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ true: '#C7D2FE', false: '#CBD5F5' }}
        thumbColor={value ? Colors.primary : '#F8FAFC'}
      />
    </View>
  );
}
