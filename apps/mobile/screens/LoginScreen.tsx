import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button, Input } from '@/components/ui';
import { typographyRN } from '@/constants/theme';
import { Colors } from '@/styles/colors';
import { Spacing } from '@/styles/spacing';
import { useAuth } from '@/providers/AuthProvider';

WebBrowser.maybeCompleteAuthSession();

const ADMIN_EMAIL = __DEV__ ? process.env.EXPO_PUBLIC_ADMIN_EMAIL ?? '' : '';
const ADMIN_PASSWORD = __DEV__ ? process.env.EXPO_PUBLIC_ADMIN_PASSWORD ?? '' : '';

export function LoginScreen() {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState(ADMIN_PASSWORD);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const router = useRouter();
  const { signIn, user, initializing, resetPassword, signInWithGoogle, signInWithApple } = useAuth();
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(8)).current;
  const [googleRequest, googleResponse, promptGoogle] = Google.useAuthRequest({
    expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (!initializing && user) {
      router.replace('/(tabs)/festivals');
    }
  }, [initializing, router, user]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 1, duration: 260, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
      Animated.timing(cardTranslate, { toValue: 0, duration: 260, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
    ]).start();
  }, [cardOpacity, cardTranslate]);

  useEffect(() => {
    const checkAppleAvailability = async () => {
      try {
        const available = await AppleAuthentication.isAvailableAsync();
        setAppleAvailable(available);
      } catch {
        setAppleAvailable(false);
      }
    };

    if (Platform.OS === 'ios') {
      void checkAppleAvailability();
    }
  }, []);

  useEffect(() => {
    if (!googleResponse) {
      return;
    }
    if (googleResponse.type !== 'success') {
      setSocialLoading(null);
      return;
    }

    const run = async () => {
      try {
        const { idToken, accessToken } = googleResponse.authentication ?? {};
        await signInWithGoogle({ idToken, accessToken });
        router.replace('/(tabs)/festivals');
      } catch (error) {
        Alert.alert('Google sign-in failed', (error as Error).message);
      } finally {
        setSocialLoading(null);
      }
    };

    void run();
  }, [googleResponse, router, signInWithGoogle]);

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

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert('Enter your email', 'Add your email above so we can send reset instructions.');
      return;
    }
    setResetting(true);
    try {
      await resetPassword(trimmedEmail);
      Alert.alert('Reset email sent', 'Check your inbox for password reset instructions.');
    } catch (error) {
      Alert.alert('Password reset failed', (error as Error).message);
    } finally {
      setResetting(false);
    }
  };

  const handleGoogle = async () => {
    if (!googleRequest) {
      Alert.alert('Google sign-in unavailable', 'Double-check your Google OAuth client IDs.');
      return;
    }
    setSocialLoading('google');
    try {
      await promptGoogle();
    } catch (error) {
      setSocialLoading(null);
      Alert.alert('Google sign-in failed', (error as Error).message);
    }
  };

  const handleApple = async () => {
    if (!appleAvailable) {
      Alert.alert('Apple Sign In unavailable', 'Apple authentication is only available on supported devices.');
      return;
    }
    setSocialLoading('apple');
    try {
      const rawNonce = Math.random().toString(36).slice(2, 12);
      const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
      const result = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
        nonce: hashedNonce,
      });
      if (!result.identityToken) {
        throw new Error('Missing Apple identity token');
      }
      await signInWithApple({ identityToken: result.identityToken, rawNonce });
      router.replace('/(tabs)/festivals');
    } catch (error) {
      if ((error as Error & { code?: string }).code === 'ERR_CANCELED') {
        setSocialLoading(null);
        return;
      }
      Alert.alert('Apple sign-in failed', (error as Error).message);
    } finally {
      setSocialLoading(null);
    }
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
      <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ translateY: cardTranslate }] }]}>
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
        <Button
          variant="primary"
          loading={isSubmitting}
          disabled={disabled}
          onPress={handleLogin}
          style={{ width: '100%' }}>
          Login
        </Button>
        <View style={{ gap: 12 }}>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '500', color: '#5A67D8' }}>
              Create account
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleForgotPassword} disabled={resetting}>
            <Text style={{ textAlign: 'center', fontSize: 13, fontWeight: '500', color: resetting ? '#CBD5F5' : '#475569' }}>
              {resetting ? 'Sending reset email...' : 'Forgot password?'}
            </Text>
          </TouchableOpacity>
          <Button variant="secondary" onPress={handleGoogle} loading={socialLoading === 'google'}>
            Continue with Google
          </Button>
          {appleAvailable ? (
            <Button variant="outline" onPress={handleApple} loading={socialLoading === 'apple'}>
              Continue with Apple
            </Button>
          ) : null}
          {hasAdminDemo ? (
            <TouchableOpacity onPress={fillDemo}>
              <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '500', color: '#475569', textDecorationLine: 'underline' }}>
                Use Admin Demo
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
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
