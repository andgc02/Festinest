import Ionicons from '@expo/vector-icons/Ionicons';
import { forwardRef } from 'react';
import { TextInput, TextInputProps, View } from 'react-native';

import { cn } from '@/lib/utils';

type SearchBarProps = TextInputProps & {
  className?: string;
  inputClassName?: string;
};

export const SearchBar = forwardRef<TextInput, SearchBarProps>(
  ({ className, inputClassName, placeholderTextColor = '#94a3b8', ...props }, ref) => {
    return (
      <View
        className={cn(
          'flex-row items-center rounded-2xl border border-slate-800 bg-slate-900/80 px-4',
          className,
        )}>
        <Ionicons name="search" size={20} color="#94a3b8" />
        <TextInput
          ref={ref}
          placeholderTextColor={placeholderTextColor}
          className={cn('flex-1 px-3 py-3 text-base text-slate-100', inputClassName)}
          {...props}
        />
      </View>
    );
  },
);

SearchBar.displayName = 'SearchBar';
