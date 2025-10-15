import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.profileRow}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>Taylor Swift</Text>
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{email}</Text>
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.label}>Preferred Genres</Text>
          <Text style={styles.value}>EDM, Pop</Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>Saved Festivals</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>Invite Friends</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050914',
    paddingHorizontal: 24,
    paddingTop: 48,
    gap: 20,
  },
  profileCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '600',
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: '#94a3b8',
  },
  value: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    paddingVertical: 8,
  },
  row: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
  },
  rowText: {
    color: '#f8fafc',
    fontSize: 16,
  },
  logout: {
    marginTop: 'auto',
    borderRadius: 16,
    paddingVertical: 16,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoutText: {
    color: '#fef2f2',
    fontSize: 16,
    fontWeight: '600',
  },
});
