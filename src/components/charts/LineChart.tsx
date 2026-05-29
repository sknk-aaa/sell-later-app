import React from 'react';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Polygon,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

// データ最大値を「きりのよい」上限に丸める
function niceMax(v: number): number {
  if (v <= 0) return 10000;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return m * pow;
}

// charts.jsx の LineChart（月別 売却済み利益）を移植
export function LineChart({
  data,
  w = 360,
  h = 200,
  highlightIdx,
  highlightLabel,
  highlightValue,
}: {
  data: { label: string; value: number }[];
  w?: number;
  h?: number;
  highlightIdx?: number;
  highlightLabel?: string;
  highlightValue?: string;
}) {
  const pad = { l: 48, r: 12, t: 16, b: 28 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const max = niceMax(Math.max(0, ...data.map((d) => d.value)));
  const step = max / 4;
  const ticks = [4, 3, 2, 1, 0].map((i) => Math.round(i * step));
  const xs = data.map((_, i) => pad.l + (innerW * i) / (data.length - 1));
  const ys = data.map((d) => pad.t + innerH - (d.value / max) * innerH);
  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xs[i]} ${ys[i]}`).join(' ');
  const areaPath = `${linePath} L ${xs[xs.length - 1]} ${pad.t + innerH} L ${xs[0]} ${pad.t + innerH} Z`;

  const tooltip = (() => {
    if (highlightIdx == null) return null;
    const tx = xs[highlightIdx];
    const ty = ys[highlightIdx];
    const bw = 76;
    const bh = 40;
    return (
      <G>
        <Rect x={tx - bw / 2} y={ty - bh - 12} width={bw} height={bh} rx={8} fill="#10B981" />
        <Polygon points={`${tx - 5},${ty - 12} ${tx + 5},${ty - 12} ${tx},${ty - 6}`} fill="#10B981" />
        <SvgText x={tx} y={ty - bh + 4} textAnchor="middle" fontSize={11} fill="rgba(255,255,255,0.85)">
          {highlightLabel ?? ''}
        </SvgText>
        <SvgText x={tx} y={ty - bh + 22} textAnchor="middle" fontSize={14} fill="#fff" fontWeight="700">
          {highlightValue ?? ''}
        </SvgText>
      </G>
    );
  })();

  return (
    <Svg width={w} height={h}>
      <Defs>
        <LinearGradient id="lineGrad" x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0%" stopColor="#10B981" stopOpacity={0.22} />
          <Stop offset="100%" stopColor="#10B981" stopOpacity={0} />
        </LinearGradient>
      </Defs>
      {ticks.map((t) => {
        const y = pad.t + innerH - (t / max) * innerH;
        return (
          <G key={t}>
            <Line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="#EEF0F4" strokeWidth={1} />
            <SvgText x={pad.l - 6} y={y + 3} fontSize={10} fill="#8A8F98" textAnchor="end">
              {`¥${t.toLocaleString()}`}
            </SvgText>
          </G>
        );
      })}
      <Path d={areaPath} fill="url(#lineGrad)" />
      <Path d={linePath} fill="none" stroke="#10B981" strokeWidth={2} />
      {data.map((d, i) => (
        <Circle
          key={i}
          cx={xs[i]}
          cy={ys[i]}
          r={i === highlightIdx ? 4.5 : 3.2}
          fill="#fff"
          stroke="#10B981"
          strokeWidth={i === highlightIdx ? 2.5 : 2}
        />
      ))}
      {data.map((d, i) => (
        <SvgText key={i} x={xs[i]} y={h - 8} fontSize={11} fill="#8A8F98" textAnchor="middle">
          {d.label}
        </SvgText>
      ))}
      {tooltip}
    </Svg>
  );
}
