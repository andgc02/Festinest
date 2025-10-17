import { ReactNode } from 'react';
import { Modal as RNModal, Pressable, StyleSheet, Text, View } from 'react-native';


import { Button } from './Button';

type ModalAction = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
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
      <Pressable
        accessibilityRole="button"
        style={[styles.overlay]
        }
        onPress={dismissOnOverlayPress ? onDismiss : undefined}>
        <Pressable
          accessibilityRole="summary"
          style={styles.panel}
          onPress={(event) => event.stopPropagation()}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {description ? <Text style={styles.description}>{description}</Text> : null}
          {children ? <View style={{ marginTop: 16 }}>{children}</View> : null}
          {(primaryAction || secondaryAction) && (
            <View style={styles.actionsRow}>
              {secondaryAction ? (
                <Button
                  variant={secondaryAction.variant ?? 'outline'}
                  onPress={secondaryAction.onPress}
                  loading={secondaryAction.loading}
                  style={{ flex: 1 }}>
                  {secondaryAction.label}
                </Button>
              ) : null}
              {primaryAction ? (
                <Button
                  variant={primaryAction.variant ?? 'primary'}
                  onPress={primaryAction.onPress}
                  loading={primaryAction.loading}
                  style={{ flex: 1 }}>
                  {primaryAction.label}
                </Button>
              ) : null}
            </View>
          )}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(2,6,23,0.70)',
    paddingHorizontal: 24,
  },
  panel: {
    width: '100%',
    maxWidth: 640,
    borderRadius: 24,
    backgroundColor: 'rgba(15,23,42,0.95)',
    padding: 24,
  },
  title: { fontSize: 20, fontWeight: '600', color: '#F8FAFC' },
  description: { marginTop: 8, fontSize: 16, color: '#CBD5E1' },
  actionsRow: { marginTop: 24, flexDirection: 'row', gap: 12 },
});
