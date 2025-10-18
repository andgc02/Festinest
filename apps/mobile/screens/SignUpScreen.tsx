import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button, Input } from '@/components/ui';
import { typographyRN } from '@/constants/theme';
import { Colors } from '@/styles/colors';
import { Spacing } from '@/styles/spacing';
import { useAuth } from '@/providers/AuthProvider';

export function SignUpScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { signUp, user, initializing } = useAuth();
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    if (!initializing && user) {
      router.replace('/(tabs)/festivals');
    }
  }, [initializing, router, user]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(cardTranslate, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
  }, [cardOpacity, cardTranslate]);

  const handleSignUp = async () => {
    const trimmedName = username.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail || !password.trim()) {
      Alert.alert('Complete the form', 'Username, email, and password are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp(trimmedEmail, password, { displayName: trimmedName });
      router.replace('/(tabs)/festivals');
    } catch (error) {
      Alert.alert('Sign up failed', (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabled =
    !username.trim().length || !email.trim().length || !password.trim().length || isSubmitting;

  return (
    <View style={styles.root}>
      <Text style={typographyRN.display}>Join Festinest</Text>
      <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ translateY: cardTranslate }] }]}>
        <View style={{ gap: 16 }}>
          <Input
            label="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoComplete="username"
            placeholder="festivalfan"
          />
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
        <Button variant="primary" loading={isSubmitting} disabled={disabled} onPress={handleSignUp}>
          Create account
        </Button>
        <TouchableOpacity onPress={() => router.replace('/login')}>
          <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '500', color: '#5A67D8' }}>
            Already have an account? Log in
          </Text>
        </TouchableOpacity>
      </Animated.View>
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

