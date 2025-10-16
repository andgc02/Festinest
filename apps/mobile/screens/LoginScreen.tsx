import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

import { Button, Input } from '@/components/ui';
import { typography } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';

const ADMIN_EMAIL = process.env.EXPO_PUBLIC_ADMIN_EMAIL ?? '';
const ADMIN_PASSWORD = process.env.EXPO_PUBLIC_ADMIN_PASSWORD ?? '';

export function LoginScreen() {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState(ADMIN_PASSWORD);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { signIn, signUp, user, initializing } = useAuth();

  useEffect(() => {
    if (!initializing && user) {
      router.replace('/(tabs)/festivals');
    }
  }, [initializing, router, user]);

  const handleLogin = async () => {
    setIsSubmitting(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)/festivals');
    } catch (error) {
      Alert.alert('Login failed', (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async () => {
    setIsSubmitting(true);
    try {
      await signUp(email.trim(), password);
      router.replace('/(tabs)/festivals');
    } catch (error) {
      Alert.alert('Sign up failed', (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = () => {
    Alert.alert('Continue with Google pressed');
  };

  const disabled = email.trim().length === 0 || password.trim().length === 0 || isSubmitting;
  const hasAdminDemo = ADMIN_EMAIL.length > 0 && ADMIN_PASSWORD.length > 0;

  const fillDemo = () => {
    setEmail(ADMIN_EMAIL);
    setPassword(ADMIN_PASSWORD);
  };

  return (
    <View className="flex-1 items-center justify-center bg-slate-950 px-6">
      <Text className={typography.display}>Festinest</Text>
      <View className="mt-8 w-full gap-6 rounded-3xl border border-slate-800/60 bg-slate-900/70 p-6">
        <View className="gap-4">
          <Input
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@festinest.com"
          />
          <Input
            label="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder={'\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
          />
        </View>
        <Button variant="primary" loading={isSubmitting} disabled={disabled} onPress={handleLogin} className="w-full">
          Login
        </Button>
        <View className="gap-3">
          <TouchableOpacity onPress={handleSignUp}>
            <Text className="text-center text-sm font-medium text-primary">Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleGoogle}>
            <Text className="text-center text-sm font-medium text-accent">Continue with Google</Text>
          </TouchableOpacity>
          {hasAdminDemo ? (
            <TouchableOpacity onPress={fillDemo}>
              <Text className="text-center text-sm font-medium text-slate-300 underline">Use Admin Demo</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}
