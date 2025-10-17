import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';


export type TabItem = {
  key: string;
  label: string;
  count?: number;
  disabled?: boolean;
};

type TabsVariant = 'pill' | 'underline';

type TabsProps = {
  items: TabItem[];
  value: string;
  onChange: (key: string) => void;
  variant?: TabsVariant;
  className?: string;
  tabClassName?: string;
};

export function Tabs({
  items,
  value,
  onChange,
  variant = 'pill',
  className,
  tabClassName,
}: TabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}>
      {items.map((item, index) => {
        const isActive = item.key === value;
        const disabled = item.disabled;
        const isLast = index === items.length - 1;
        const pressableStyle =
          variant === 'pill'
            ? [
                styles.pill,
                isActive ? styles.pillActive : styles.pillInactive,
                disabled && styles.disabled,
                isLast && styles.last,
              ]
            : [
                styles.underline,
                isActive ? styles.underlineActive : styles.underlineInactive,
                disabled && styles.disabled,
                isLast && styles.last,
              ];

        return (
          <Pressable
            key={item.key}
            accessibilityRole="button"
            hitSlop={8}
            disabled={disabled}
            style={pressableStyle}
            onPress={() => onChange(item.key)}>
            <Text
              style={[
                styles.label,
                variant === 'underline' && styles.labelUnderline,
                isActive ? styles.labelActive : styles.labelInactive,
              ]}>
              {item.label}
            </Text>
            {item.count !== undefined ? (
              <View style={[styles.count, isActive ? styles.countActive : styles.countInactive]}>
                <Text style={[styles.countText, isActive ? styles.countTextActive : styles.countTextInactive]}>
                  {item.count}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { paddingHorizontal: 0 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    marginRight: 12,
    gap: 8,
  },
  pillActive: { borderColor: '#5A67D8', backgroundColor: '#E2E8F0' },
  pillInactive: { borderColor: '#E2E8F0', backgroundColor: 'transparent' },
  underline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    marginRight: 24,
    gap: 8,
    borderBottomWidth: 2,
  },
  underlineActive: { borderBottomColor: '#5A67D8' },
  underlineInactive: { borderBottomColor: 'transparent' },
  last: { marginRight: 0 },
  disabled: { opacity: 0.5 },
  label: { fontSize: 14, fontWeight: '600' },
  labelUnderline: { fontSize: 16 },
  labelActive: { color: '#5A67D8' },
  labelInactive: { color: '#475569' },
  count: { borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 2 },
  countActive: { backgroundColor: '#E2E8F0' },
  countInactive: { backgroundColor: '#F1F5F9' },
  countText: { fontSize: 12, fontWeight: '600' },
  countTextActive: { color: '#1A202C' },
  countTextInactive: { color: '#475569' },
});
