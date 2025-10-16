import { useRouter } from 'expo-router';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '@/components/ui';
import { typography } from '@/constants/theme';
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
    <View className="flex-1 bg-slate-950 px-6 pt-16">
      <Text className={typography.heading}>Settings</Text>

      <View className="mt-6 gap-4 rounded-3xl bg-slate-900/70 p-5">
        <Text className={typography.subheading}>Profile</Text>
        <ProfileRow label="Name" value="Taylor Swift" />
        <ProfileRow label="Email" value={email} />
        <ProfileRow label="Preferred Genres" value="EDM, Pop" />
      </View>

      <View className="mt-6 rounded-3xl bg-slate-900/70">
        {['Notifications', 'Saved Festivals', 'Invite Friends'].map((item, index, array) => (
          <TouchableOpacity
            key={item}
            className={`px-5 py-4 ${index !== array.length - 1 ? 'border-b border-slate-800/60' : ''}`}>
            <Text className="text-base text-slate-100">{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button className="mt-auto mb-10" variant="outline" onPress={handleLogout}>
        Logout
      </Button>
    </View>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-slate-400">{label}</Text>
      <Text className="text-sm font-semibold text-slate-100">{value}</Text>
    </View>
  );
}
