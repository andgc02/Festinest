import { ReactNode } from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';


type CardProps = ViewProps & {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className, style, ...props }: CardProps) {
  return (
    <View
      style={[styles.container, style]}
      {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(15,23,42,0.70)',
    shadowColor: '#0f172a',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
});
