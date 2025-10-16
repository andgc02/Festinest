import { Redirect } from 'expo-router';

import { useAuth } from '@/providers/AuthProvider';

export default function IndexRoute() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return null;
  }

  return <Redirect href={user ? '/(tabs)/festivals' : '/login'} />;
}
