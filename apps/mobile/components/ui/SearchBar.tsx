import Ionicons from '@expo/vector-icons/Ionicons';
import { forwardRef } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';


type SearchBarProps = TextInputProps & {
  className?: string;
  inputClassName?: string;
};

export const SearchBar = forwardRef<TextInput, SearchBarProps>(
  ({ className, inputClassName, placeholderTextColor = '#94A3B8', ...props }, ref) => {
    return (
      <View style={styles.container}>
        <Ionicons name="search" size={20} color="#64748B" />
        <TextInput
          ref={ref}
          placeholderTextColor={placeholderTextColor}
          style={[styles.input]}
          {...props}
        />
      </View>
    );
  },
);

SearchBar.displayName = 'SearchBar';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A202C',
  },
});
