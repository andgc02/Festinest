import { ReactNode } from 'react';
import { Modal as RNModal, Pressable, Text, View } from 'react-native';

import { cn } from '@/lib/utils';

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
        style={{ flex: 1 }}
        className="items-center justify-center bg-slate-950/70 px-6"
        onPress={dismissOnOverlayPress ? onDismiss : undefined}>
        <Pressable
          accessibilityRole="summary"
          className={cn('w-full max-w-xl rounded-3xl bg-slate-900/95 p-6', className)}
          onPress={(event) => event.stopPropagation()}>
          {title ? <Text className="text-xl font-semibold text-slate-50">{title}</Text> : null}
          {description ? <Text className="mt-2 text-base text-slate-300">{description}</Text> : null}
          {children ? <View className="mt-4">{children}</View> : null}
          {(primaryAction || secondaryAction) && (
            <View className="mt-6 flex-row gap-3">
              {secondaryAction ? (
                <Button
                  variant={secondaryAction.variant ?? 'outline'}
                  onPress={secondaryAction.onPress}
                  loading={secondaryAction.loading}
                  className="flex-1">
                  {secondaryAction.label}
                </Button>
              ) : null}
              {primaryAction ? (
                <Button
                  variant={primaryAction.variant ?? 'primary'}
                  onPress={primaryAction.onPress}
                  loading={primaryAction.loading}
                  className="flex-1">
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
