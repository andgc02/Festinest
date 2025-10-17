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
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
