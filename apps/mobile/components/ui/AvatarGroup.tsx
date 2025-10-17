import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { Colors } from '@/styles/colors';

import { Avatar } from './Avatar';

export type AvatarGroupItem = {
  id: string;
  name?: string;
  imageUri?: string;
};

export type AvatarGroupProps = {
  avatars: AvatarGroupItem[];
  maxVisible?: number;
  size?: number;
  overlap?: number;
  style?: StyleProp<ViewStyle>;
};

export function AvatarGroup({
  avatars,
  maxVisible = 4,
  size = 40,
  overlap,
  style,
}: AvatarGroupProps) {
  if (!avatars.length) {
    return null;
  }

  const visible = avatars.slice(0, maxVisible);
  const overflowCount = avatars.length - visible.length;
  const overlapAmount = overlap ?? Math.round(size * 0.45);

  return (
    <View style={[styles.root, style]}>
      {visible.map((avatar, index) => (
        <Avatar
          key={avatar.id}
          name={avatar.name}
          imageUri={avatar.imageUri}
          size={size}
          borderColor={Colors.background}
          style={index === 0 ? null : { marginLeft: -overlapAmount }}
        />
      ))}
      {overflowCount > 0 ? (
        <View
          style={[
            styles.overflow,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              marginLeft: -overlapAmount,
            },
          ]}>
          <Text style={[styles.overflowText, { fontSize: Math.round(size / 2.4) }]}>{`+${overflowCount}`}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overflow: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderColor: Colors.background,
    borderWidth: 1,
  },
  overflowText: {
    fontWeight: '600',
    color: Colors.text,
  },
});
