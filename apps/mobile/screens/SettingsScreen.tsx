import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '@/components/ui';
import { typographyRN } from '@/constants/theme';
import { Colors } from '@/styles/colors';
import { Spacing } from '@/styles/spacing';
import { useAuth } from '@/providers/AuthProvider';

export function SettingsScreen() {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const email = user?.email ?? 'admin@festinest.dev';

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      Alert.alert('Logout failed', (error as Error).message);
    }
  };

  return (
    <View style={styles.root}>
      <Text style={typographyRN.heading}>Settings</Text>

      <View style={styles.card}>
        <Text style={typographyRN.subheading}>Profile</Text>
        <ProfileRow label="Name" value="Taylor Swift" />
        <ProfileRow label="Email" value={email} />
        <ProfileRow label="Preferred Genres" value="EDM, Pop" />
      </View>

      <View style={styles.list}>
        {['Notifications', 'Saved Festivals', 'Invite Friends'].map((item, index, array) => (
          <TouchableOpacity key={item} style={[styles.listItem, index !== array.length - 1 && styles.listDivider]}>
            <Text style={{ fontSize: 16, color: '#1A202C' }}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button variant="outline" onPress={handleLogout} style={{ marginTop: 'auto', marginBottom: 40 }}>
        Logout
      </Button>
    </View>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={{ fontSize: 14, color: '#94A3B8' }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#F1F5F9' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: Spacing.screenPadding, paddingTop: 16 },
  card: {
    marginTop: 24,
    gap: 16,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    padding: 20,
  },
  list: { marginTop: 24, borderRadius: 24, backgroundColor: Colors.surface },
  listItem: { paddingHorizontal: 20, paddingVertical: 16 },
  listDivider: { borderBottomWidth: 1, borderBottomColor: 'rgba(30,41,59,0.60)' },
});
