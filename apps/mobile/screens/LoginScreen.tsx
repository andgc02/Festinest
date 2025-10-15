import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useAuth } from '@/providers/AuthProvider';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { signIn, signUp, user, initializing } = useAuth();

  useEffect(() => {
    if (!initializing && user) {
      router.replace('(tabs)/festivals');
    }
  }, [initializing, router, user]);

  const handleLogin = async () => {
    setIsSubmitting(true);
    try {
      await signIn(email.trim(), password);
      router.replace('(tabs)/festivals');
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
      router.replace('(tabs)/festivals');
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

  if (initializing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>FESTINEST</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={[styles.primaryButton, (disabled || isSubmitting) && styles.primaryButtonDisabled]}
          onPress={handleLogin}
          disabled={disabled}>
          {isSubmitting ? <ActivityIndicator color="#f9fafb" /> : <Text style={styles.primaryButtonText}>Login</Text>}
        </TouchableOpacity>
        <View style={styles.secondaryActions}>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.secondaryText}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleGoogle}>
            <Text style={styles.secondaryText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050914',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: '#050914',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    color: '#f5f5f5',
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 32,
    letterSpacing: 6,
  },
  form: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 24,
    borderRadius: 20,
    gap: 16,
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#f9fafb',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  primaryButton: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f46e5',
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    color: '#f9fafb',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActions: {
    gap: 8,
  },
  secondaryText: {
    color: '#a855f7',
    fontSize: 14,
    textAlign: 'center',
  },
});
