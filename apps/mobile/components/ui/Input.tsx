import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

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
      <View style={{ gap: 8 }}>
        {label ? <Text style={{ fontSize: 14, fontWeight: '600', color: '#E2E8F0' }}>{label}</Text> : null}
        <TextInput
          ref={ref}
          placeholderTextColor={placeholderTextColor}
          style={[
            styles.input,
            props.style as any,
          ]}
          {...props}
        />
        {hint && !error ? <Text style={{ fontSize: 12, color: '#94A3B8' }}>{hint}</Text> : null}
        {error ? <Text style={{ fontSize: 12, color: '#E53E3E' }}>{error}</Text> : null}
      </View>
    );
  },
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937', // slate-800
    backgroundColor: 'rgba(15,23,42,0.80)', // slate-900/80
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#F1F5F9', // slate-100
  },
});
