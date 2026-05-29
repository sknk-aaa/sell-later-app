import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, numFont } from '@/theme/tokens';

// charts.jsx の Donut を移植（strokeDasharray 方式）
export function Donut({
  data,
  size = 180,
  thickness = 28,
  centerLabel,
  centerValue,
}: {
  data: { value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;
  const gap = 2;

  let offset = -90;
  const arcs = data.map((d, i) => {
    const frac = d.value / total;
    const arcLen = C * frac - gap;
    const startAngle = offset;
    offset += 360 * frac;
    return (
      <Circle
        key={i}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={d.color}
        strokeWidth={thickness}
        strokeDasharray={`${Math.max(arcLen, 0)} ${C}`}
        strokeDashoffset={-C * ((startAngle + 90) / 360)}
        rotation={-90}
        originX={cx}
        originY={cy}
      />
    );
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {arcs}
      </Svg>
      {(centerLabel || centerValue) && (
        <View style={styles.center} pointerEvents="none">
          {centerLabel && <Text style={styles.label}>{centerLabel}</Text>}
          {centerValue && <Text style={styles.value}>{centerValue}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: { fontSize: 13, color: colors.ink3 },
  value: { fontSize: 18, fontWeight: '700', color: colors.ink1, ...numFont },
});
