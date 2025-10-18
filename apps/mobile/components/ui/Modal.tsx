import { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal as RNModal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';


import { Button } from './Button';

type ModalAction = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
};

type ModalProps = {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  primaryAction?: ModalAction;
  secondaryAction?: ModalAction;
  dismissOnOverlayPress?: boolean;
  className?: string;
};

export function Modal({
  visible,
  onDismiss,
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
  dismissOnOverlayPress = true,
  className,
}: ModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}>
        <Pressable
          accessibilityRole="button"
          style={styles.overlay}
          onPress={dismissOnOverlayPress ? onDismiss : undefined}>
          <Pressable
            accessibilityRole="summary"
            style={styles.panel}
            onPress={(event) => event.stopPropagation()}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {description ? <Text style={styles.description}>{description}</Text> : null}
            {/* scrollable content */}
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
              {children ? <View style={{ marginTop: 0 }}>{children}</View> : null}
              {(primaryAction || secondaryAction) && (
              <View style={styles.actionsRow}>
                {secondaryAction ? (
                  <Button
                    variant={secondaryAction.variant ?? 'outline'}
                    onPress={secondaryAction.onPress}
                    loading={secondaryAction.loading}
                    disabled={secondaryAction.disabled}
                    style={{ flex: 1 }}>
                    {secondaryAction.label}
                  </Button>
                ) : null}
                {primaryAction ? (
                  <Button
                    variant={primaryAction.variant ?? 'primary'}
                    onPress={primaryAction.onPress}
                    loading={primaryAction.loading}
                    disabled={primaryAction.disabled}
                    style={{ flex: 1 }}>
                    {primaryAction.label}
                  </Button>
                ) : null}
              </View>
            )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 24,
  },
  panel: {
    maxHeight: '80%',
    width: '100%',
    maxWidth: 640,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  title: { fontSize: 20, fontWeight: '600', color: '#1A202C' },
  description: { marginTop: 8, fontSize: 16, color: '#334155' },
  content: { marginTop: 16, paddingBottom: 8 },
  actionsRow: { marginTop: 24, flexDirection: 'row', gap: 12 },
});
