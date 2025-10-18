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

import { Button, Input } from '@/components/ui';
import { useProfileDetails } from '@/hooks/useProfileDetails';
import { Colors } from '@/styles/colors';
import { Spacing } from '@/styles/spacing';

export function ProfileEditScreen() {
  const router = useRouter();
  const { profile, updateProfile, loading } = useProfileDetails();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [homeBase, setHomeBase] = useState(profile.homeBase);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading) {
      setDisplayName(profile.displayName);
      setHomeBase(profile.homeBase);
    }
  }, [loading, profile.displayName, profile.homeBase]);

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
  formSection: {
    gap: 16,
  },
  buttonStack: {
    gap: 12,
    marginTop: 12,
  },
});

