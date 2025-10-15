import { forwardRef } from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

import { cn } from '@/lib/utils';

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
};

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, hint, className, placeholderTextColor = '#94a3b8', ...props }, ref) => {
    return (
      <View className="gap-2">
        {label ? <Text className="text-sm font-semibold text-slate-200">{label}</Text> : null}
        <TextInput
          ref={ref}
          placeholderTextColor={placeholderTextColor}
          className={cn(
            'h-12 rounded-xl border border-slate-800 bg-slate-900/80 px-4 text-base text-slate-100',
            className,
          )}
          {...props}
        />
        {hint && !error ? <Text className="text-xs text-slate-400">{hint}</Text> : null}
        {error ? <Text className="text-xs text-error">{error}</Text> : null}
      </View>
    );
  },
);

Input.displayName = 'Input';
