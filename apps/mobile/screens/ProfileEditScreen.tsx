import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button, FilterChip, Input } from '@/components/ui';
import { Avatar } from '@/components/ui/Avatar';
import { useGenrePreferences } from '@/hooks/useGenrePreferences';
import { useProfileDetails } from '@/hooks/useProfileDetails';
import { fetchFestivals } from '@/services/festivals';
import { Colors } from '@/styles/colors';
import { Spacing } from '@/styles/spacing';
import { Festival } from '@/types/festival';

export function ProfileEditScreen() {
  const router = useRouter();
  const { profile, updateProfile, loading } = useProfileDetails();
  const { genres: preferredGenres, toggleGenre } = useGenrePreferences();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [homeBase, setHomeBase] = useState(profile.homeBase);
  const [avatarUri, setAvatarUri] = useState(profile.avatarUri ?? '');
  const [saving, setSaving] = useState(false);
  const [genresLoading, setGenresLoading] = useState(true);
  const [genresError, setGenresError] = useState<string | null>(null);
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);

  useEffect(() => {
    if (!loading) {
      setDisplayName(profile.displayName);
      setHomeBase(profile.homeBase);
      setAvatarUri(profile.avatarUri ?? '');
    }
  }, [loading, profile.displayName, profile.homeBase, profile.avatarUri]);

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const data = await fetchFestivals();
        setAvailableGenres(extractGenres(data));
        setGenresError(null);
      } catch (error) {
        setGenresError('Could not load festival genres.');
      } finally {
        setGenresLoading(false);
      }
    };

    void loadGenres();
  }, []);

  const handlePickAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Allow photo access to choose an avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.length) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Avatar error', 'We could not open your photo library. Try again.');
    }
  };

  const handleSave = async () => {
    const trimmedName = displayName.trim();
    if (!trimmedName.length) {
      Alert.alert('Add a name', 'Please enter a display name before saving.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        displayName: trimmedName,
        homeBase: homeBase.trim(),
        avatarUri: avatarUri.trim().length ? avatarUri : undefined,
      });
      Alert.alert('Profile updated', 'Your profile details were saved on this device.');
      router.back();
    } catch (error) {
      Alert.alert('Save failed', (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Edit Profile</Text>
        <Text style={styles.subheading}>
          Update what your friends and groups see. Changes apply locally for the Expo demo.
        </Text>

        <View style={styles.avatarSection}>
          <Avatar name={displayName || profile.displayName} imageUri={avatarUri} size={96} showBorder />
          <View style={styles.avatarButtons}>
            <Button variant="secondary" onPress={handlePickAvatar}>
              Choose photo
            </Button>
            {avatarUri ? (
              <Button variant="outline" onPress={() => setAvatarUri('')} disabled={saving}>
                Remove
              </Button>
            ) : null}
          </View>
        </View>

        <View style={styles.formSection}>
          <Input
            label="Display name"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            autoComplete="name"
            returnKeyType="next"
          />
          <Input
            label="Home base"
            value={homeBase}
            onChangeText={setHomeBase}
            placeholder="City, State or Country"
            autoCapitalize="words"
            returnKeyType="done"
            hint="Optional, helps with travel recommendations later."
          />
        </View>

        <View style={styles.genreSection}>
          <View style={styles.genreHeader}>
            <Text style={styles.genreTitle}>Preferred genres</Text>
            <Text style={styles.genreSubtitle}>Surface these across discovery, recaps, and invites.</Text>
          </View>
          {genresError ? <Text style={styles.errorText}>{genresError}</Text> : null}
          {genresLoading ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 12 }} />
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
            <Text style={styles.genreSubtitle}>Genres will appear once festival data loads.</Text>
          )}
        </View>

        <View style={styles.buttonStack}>
          <Button onPress={handleSave} loading={saving}>
            Save changes
          </Button>
          <Button variant="outline" onPress={() => router.back()} disabled={saving}>
            Cancel
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  subheading: {
    fontSize: 14,
    color: '#475569',
  },
  avatarSection: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  avatarButtons: {
    flex: 1,
    gap: 8,
  },
  formSection: {
    gap: 16,
  },
  genreSection: {
    gap: 12,
    padding: 16,
    borderRadius: 20,
    backgroundColor: Colors.surface,
  },
  genreHeader: {
    gap: 4,
  },
  genreTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  genreSubtitle: {
    fontSize: 13,
    color: '#475569',
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
  },
  genreChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  buttonStack: {
    gap: 12,
    marginTop: 12,
  },
});

function extractGenres(festivals: Festival[]): string[] {
  const set = new Set<string>();
  festivals.forEach((festival) => {
    if (Array.isArray(festival.genres) && festival.genres.length) {
      festival.genres.forEach((genre) => {
        const trimmed = genre?.trim();
        if (trimmed) {
          set.add(trimmed);
        }
      });
    } else if (festival.genre) {
      festival.genre.split(',').forEach((part) => {
        const trimmed = part.trim();
        if (trimmed) {
          set.add(trimmed);
        }
      });
    }
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
