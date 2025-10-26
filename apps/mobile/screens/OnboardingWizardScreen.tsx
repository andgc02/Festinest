import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, FilterChip } from '@/components/ui';
import { typographyRN } from '@/constants/theme';
import { Colors } from '@/styles/colors';
import { Spacing } from '@/styles/spacing';
import { useOnboarding } from '@/providers/OnboardingProvider';
import { useAuth } from '@/providers/AuthProvider';
import { activatePremiumPreview } from '@/services/premium';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';

const STEPS = [
  {
    title: 'Sync your plan',
    highlight: 'Save festivals and keep them in sync across devices.',
    points: ['Saved festivals now sync with your account', 'Schedule builder remembers your picks', 'Nicknames flow through badges and recaps'],
  },
  {
    title: 'Stay in the loop',
    highlight: 'Notification controls and privacy tools keep you in charge.',
    points: ['Updated privacy + data export options', 'Notification center for votes and schedule changes', 'Password reset + social login for frictionless access'],
  },
  {
    title: 'Preview premium mode',
    highlight: 'Companion mode gives you a live festival cockpit.',
    points: ['Group updates, saved schedule, and quick actions', 'Premium upsell CTA inside settings', 'Lightning polls + leader tools already unlocked'],
  },
];

export function OnboardingWizardScreen() {
  const [stepIndex, setStepIndex] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);
  const router = useRouter();
  const { markComplete } = useOnboarding();
  const { user } = useAuth();
  const userId = user?.uid;
  const { isPremium, loading: premiumLoading, refresh } = usePremiumStatus(userId);

  const currentStep = STEPS[stepIndex];

  const progress = useMemo(() => ((stepIndex + 1) / STEPS.length) * 100, [stepIndex]);

  const finish = async () => {
    await markComplete();
    router.replace('/(tabs)/festivals');
  };

  const handleNext = () => {
    if (stepIndex === STEPS.length - 1) {
      void finish();
      return;
    }
    setStepIndex((prev) => Math.min(STEPS.length - 1, prev + 1));
  };

  const handleBack = () => {
    if (stepIndex === 0) {
      void finish();
      return;
    }
    setStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handlePremiumPreview = async () => {
    if (!userId) {
      Alert.alert('Sign in required', 'Log in to unlock the premium preview.');
      return;
    }
    setPreviewLoading(true);
    try {
      await activatePremiumPreview(userId);
      await refresh();
      await markComplete();
      router.replace('/companion');
    } catch (error) {
      Alert.alert('Unable to start preview', (error as Error).message);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={{ gap: 8 }}>
          <Text style={typographyRN.subheading}>Week 4 onboarding</Text>
          <Text style={typographyRN.display}>Bring your plan to life</Text>
          <Text style={{ fontSize: 15, color: '#475569' }}>
            {`Step ${stepIndex + 1} of ${STEPS.length}`} • {currentStep.highlight}
          </Text>
        </View>

        <Card style={styles.stepCard}>
          <Text style={styles.stepTitle}>{currentStep.title}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <FilterChip label="Auth & Settings" selected />
            <FilterChip label="Premium" />
          </View>
          <View style={{ gap: 12 }}>
            {currentStep.points.map((point, index) => (
              <View key={point} style={styles.pointRow}>
                <View style={styles.pointBullet}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primary }}>{index + 1}</Text>
                </View>
                <Text style={styles.pointText}>{point}</Text>
              </View>
            ))}
          </View>
        </Card>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <View style={styles.actionsRow}>
          <Button variant="outline" onPress={handleBack}>
            {stepIndex === 0 ? 'Skip' : 'Back'}
          </Button>
          <Button variant="primary" onPress={handleNext}>
            {stepIndex === STEPS.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </View>

        <Card style={styles.premiumCard}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.text }}>Festival Companion Mode</Text>
          <Text style={{ marginTop: 4, fontSize: 14, color: '#475569' }}>
            Live schedule, group updates, and saved nicknames in one premium-friendly dashboard.
          </Text>
          <Button
            style={{ marginTop: 16 }}
            variant={isPremium ? 'secondary' : 'primary'}
            onPress={handlePremiumPreview}
            loading={previewLoading || premiumLoading}>
            {isPremium ? 'Launch Companion Mode' : 'Start premium preview'}
          </Button>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 16,
  },
  stepCard: {
    gap: 12,
    padding: 20,
  },
  stepTitle: { fontSize: 20, fontWeight: '700', color: Colors.text },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  pointBullet: {
    height: 28,
    width: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },
  pointText: { flex: 1, fontSize: 15, color: '#1E293B' },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  actionsRow: { flexDirection: 'row', gap: 12 },
  premiumCard: {
    marginTop: 'auto',
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});
