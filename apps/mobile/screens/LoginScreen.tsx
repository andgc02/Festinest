import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button, Input } from '@/components/ui';
import { typographyRN } from '@/constants/theme';
import { Colors } from '@/styles/colors';
import { Spacing } from '@/styles/spacing';
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
    <View style={styles.root}>
      <Text style={typographyRN.display}>Festinest</Text>
      <View style={styles.card}>
        <View style={{ gap: 16 }}>
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
        <Button variant="primary" loading={isSubmitting} disabled={disabled} onPress={handleLogin} style={{ width: '100%' }}>
          Login
        </Button>
        <View style={{ gap: 12 }}>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '500', color: '#5A67D8' }}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleGoogle}>
            <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '500', color: '#38B2AC' }}>Continue with Google</Text>
          </TouchableOpacity>
          {hasAdminDemo ? (
            <TouchableOpacity onPress={fillDemo}>
              <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '500', color: '#CBD5E1', textDecorationLine: 'underline' }}>Use Admin Demo</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.screenPadding,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    marginTop: 32,
    width: '100%',
    gap: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: Colors.surface,
    padding: 24,
  },
});
