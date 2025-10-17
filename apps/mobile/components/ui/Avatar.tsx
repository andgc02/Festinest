import { useMemo, useState } from 'react';
import { Image, ImageSourcePropType, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { Colors } from '@/styles/colors';

export type AvatarProps = {
  name?: string;
  imageUri?: string;
  source?: ImageSourcePropType;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
  showBorder?: boolean;
  borderColor?: string;
  style?: StyleProp<ViewStyle>;
};

export function Avatar({
  name,
  imageUri,
  source,
  size = 40,
  backgroundColor = '#E2E8F0',
  textColor = Colors.text,
  showBorder = true,
  borderColor = '#FFFFFF',
  style,
}: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const imageSource = useMemo<ImageSourcePropType | undefined>(() => {
    if (source) {
      return source;
    }

    if (imageUri) {
      return { uri: imageUri };
    }

    return undefined;
  }, [imageUri, source]);

  const fallbackInitial = useMemo(() => {
    const first = name?.trim().charAt(0) ?? '?';
    return first.toUpperCase();
  }, [name]);

  const dimension = size;
  const borderRadius = dimension / 2;

  const showImage = imageSource && !imageFailed;

  return (
    <View
      style={[
        styles.container,
        {
          width: dimension,
          height: dimension,
          borderRadius,
          backgroundColor,
          borderWidth: showBorder ? 1 : 0,
          borderColor,
        },
        style,
      ]}>
      {showImage ? (
        <Image
          source={imageSource}
          style={{ width: dimension, height: dimension, borderRadius }}
          resizeMode="cover"
          onError={() => setImageFailed(true)}
          accessibilityRole="image"
          accessibilityLabel={name ? `${name} avatar` : 'User avatar'}
        />
      ) : (
        <Text style={[styles.fallback, { fontSize: dimension / 2, color: textColor }]}>{fallbackInitial}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallback: {
    fontWeight: '600',
  },
});
