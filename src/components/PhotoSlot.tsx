import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';
import { colors } from '@/theme/tokens';

// shared.jsx の PhotoSlot（斜めストライプのプレースホルダー）を移植
// repeating-linear-gradient(135deg, #EDEFF3 0 8px, #E4E7EC 8px 16px) を SVG Pattern で再現
export function PhotoSlot({
  label = 'photo',
  ratio,
  radius = 12,
  style,
}: {
  label?: string;
  ratio?: number; // aspectRatio（例: 4/3, 1）
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const patternId = `stripes-${id}`;
  return (
    <View
      style={[
        styles.box,
        ratio != null && { aspectRatio: ratio },
        { borderRadius: radius },
        style,
      ]}
    >
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <Pattern
            id={patternId}
            patternUnits="userSpaceOnUse"
            width={16}
            height={16}
            patternTransform="rotate(45)"
          >
            <Rect width={16} height={16} fill="#EDEFF3" />
            <Rect width={8} height={16} fill="#E4E7EC" />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </Svg>
      <Text style={styles.caption} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDEFF3',
  },
  caption: {
    color: colors.ink3,
    fontFamily: 'Menlo',
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
