import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

// shared.jsx の Icon を react-native-svg へ移植（パスデータは同一）
export type IconName =
  | 'home' | 'list' | 'chart' | 'settings' | 'plus' | 'star' | 'starFill'
  | 'chevR' | 'chevL' | 'chevD' | 'chevU' | 'bell' | 'more' | 'search'
  | 'filter' | 'grid' | 'rows' | 'pin' | 'box' | 'bag' | 'clock' | 'archive'
  | 'checkCircle' | 'pause' | 'tag' | 'chart2' | 'calendar' | 'flag' | 'note'
  | 'edit' | 'pencil' | 'trash' | 'share' | 'copy' | 'chartLine' | 'sliders'
  | 'user' | 'cloud' | 'download' | 'palette' | 'percent' | 'folder' | 'help'
  | 'mail' | 'doc' | 'shield' | 'info' | 'crown' | 'close' | 'closeCircle'
  | 'helpCircle';

type Props = {
  name: IconName;
  size?: number;
  fill?: boolean;
  color?: string;
};

export function Icon({ name, size = 22, fill = false, color }: Props) {
  const stroke = color || '#14181F';
  const baseFill = fill ? stroke : 'none';
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: baseFill,
    stroke,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  const paths: Record<IconName, React.ReactNode> = {
    home: <><Path d="M3 11.5L12 4l9 7.5" /><Path d="M5 10v10h14V10" /></>,
    list: <>
      <Path d="M8 6h13M8 12h13M8 18h13" />
      <Circle cx={4} cy={6} r={1.3} fill={stroke} stroke="none" />
      <Circle cx={4} cy={12} r={1.3} fill={stroke} stroke="none" />
      <Circle cx={4} cy={18} r={1.3} fill={stroke} stroke="none" />
    </>,
    chart: <>
      <Path d="M12 3a9 9 0 109 9h-9V3z" />
      <Path d="M14 3a7 7 0 017 7h-7V3z" fill={stroke} stroke="none" opacity={0.9} />
    </>,
    settings: <>
      <Circle cx={12} cy={12} r={3} />
      <Path d="M19 12a7 7 0 00-.1-1.2l2-1.5-2-3.5-2.4 1a7 7 0 00-2-1.2L14 3h-4l-.5 2.6a7 7 0 00-2 1.2l-2.4-1-2 3.5 2 1.5A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.5 2.4-1a7 7 0 002 1.2L10 21h4l.5-2.6a7 7 0 002-1.2l2.4 1 2-3.5-2-1.5c.1-.4.1-.8.1-1.2z" />
    </>,
    plus: <Path d="M12 5v14M5 12h14" />,
    star: <Path d="M12 3l2.7 5.6 6.3.9-4.5 4.4 1 6.2L12 17l-5.5 3.1 1-6.2L3 9.5l6.3-.9L12 3z" />,
    starFill: <Path d="M12 3l2.7 5.6 6.3.9-4.5 4.4 1 6.2L12 17l-5.5 3.1 1-6.2L3 9.5l6.3-.9L12 3z" fill="#F5B82B" stroke="#F5B82B" />,
    chevR: <Path d="M9 6l6 6-6 6" />,
    chevL: <Path d="M15 6l-6 6 6 6" />,
    chevD: <Path d="M6 9l6 6 6-6" />,
    chevU: <Path d="M6 15l6-6 6 6" />,
    bell: <><Path d="M6 8a6 6 0 1112 0v5l1.5 3h-15L6 13V8z" /><Path d="M10 19a2 2 0 004 0" /></>,
    more: <>
      <Circle cx={6} cy={12} r={1.3} fill={stroke} stroke="none" />
      <Circle cx={12} cy={12} r={1.3} fill={stroke} stroke="none" />
      <Circle cx={18} cy={12} r={1.3} fill={stroke} stroke="none" />
    </>,
    search: <><Circle cx={11} cy={11} r={7} /><Path d="M16 16l4 4" /></>,
    filter: <Path d="M4 6h16M7 12h10M10 18h4" />,
    grid: <>
      <Rect x={3.5} y={3.5} width={7} height={7} rx={1.5} />
      <Rect x={13.5} y={3.5} width={7} height={7} rx={1.5} />
      <Rect x={3.5} y={13.5} width={7} height={7} rx={1.5} />
      <Rect x={13.5} y={13.5} width={7} height={7} rx={1.5} />
    </>,
    rows: <>
      <Path d="M4 7h16M4 12h16M4 17h16" />
      <Circle cx={2.5} cy={7} r={0.8} fill={stroke} stroke="none" />
      <Circle cx={2.5} cy={12} r={0.8} fill={stroke} stroke="none" />
      <Circle cx={2.5} cy={17} r={0.8} fill={stroke} stroke="none" />
    </>,
    pin: <><Path d="M12 21s-7-6.5-7-12a7 7 0 0114 0c0 5.5-7 12-7 12z" /><Circle cx={12} cy={9} r={2.5} /></>,
    box: <><Path d="M3 8l9-4 9 4-9 4-9-4z" /><Path d="M3 8v8l9 4 9-4V8" /><Path d="M12 12v8" /></>,
    bag: <><Path d="M6 8h12l-1 12H7L6 8z" /><Path d="M9 8V6a3 3 0 016 0v2" /></>,
    clock: <><Circle cx={12} cy={12} r={8} /><Path d="M12 8v4l3 2" /></>,
    archive: <><Rect x={3} y={5} width={18} height={4} rx={1} /><Path d="M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9" /><Path d="M10 13h4" /></>,
    checkCircle: <><Circle cx={12} cy={12} r={8} /><Path d="M8.5 12.5l2.5 2.5L16 9.5" /></>,
    pause: <><Circle cx={12} cy={12} r={8} /><Path d="M10 9v6M14 9v6" /></>,
    tag: <><Path d="M3 12V4h8l10 10-8 8-10-10z" /><Circle cx={7.5} cy={7.5} r={1.3} fill={stroke} stroke="none" /></>,
    chart2: <Path d="M4 20V10M10 20V4M16 20v-7M20 20v-4" />,
    calendar: <><Rect x={3.5} y={5.5} width={17} height={15} rx={2} /><Path d="M3.5 10h17M8 3v4M16 3v4" /></>,
    flag: <Path d="M5 21V4h12l-2.5 3.5L17 11H5" />,
    note: <><Rect x={4} y={4} width={16} height={16} rx={2} /><Path d="M8 9h8M8 13h8M8 17h5" /></>,
    edit: <><Path d="M4 20h4l11-11-4-4L4 16v4z" /><Path d="M14 6l4 4" /></>,
    pencil: <Path d="M4 20h4l11-11-4-4L4 16v4z" />,
    trash: <><Path d="M5 7h14M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" /><Path d="M7 7l1 13a1 1 0 001 1h6a1 1 0 001-1l1-13" /></>,
    share: <>
      <Circle cx={6} cy={12} r={2.5} />
      <Circle cx={18} cy={6} r={2.5} />
      <Circle cx={18} cy={18} r={2.5} />
      <Path d="M8.2 10.8l7.6-4M8.2 13.2l7.6 4" />
    </>,
    copy: <><Rect x={8} y={8} width={12} height={12} rx={2} /><Path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" /></>,
    chartLine: <Path d="M4 17l4-4 3 3 5-6 4 4" />,
    sliders: <>
      <Path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h14M20 18h0" />
      <Circle cx={15} cy={6} r={2} />
      <Circle cx={7} cy={12} r={2} />
      <Circle cx={18} cy={18} r={2} />
    </>,
    user: <><Circle cx={12} cy={8} r={3.5} /><Path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" /></>,
    cloud: <Path d="M7 19a4 4 0 010-8 6 6 0 0111-2 5 5 0 01-1 10H7z" />,
    download: <><Path d="M12 4v12M7 11l5 5 5-5" /><Path d="M5 20h14" /></>,
    palette: <>
      <Path d="M12 3a9 9 0 100 18c1.5 0 2.5-1 2.5-2.3 0-1.2-1-1.7-1-2.7 0-1 1-1.5 2-1.5h2A3.5 3.5 0 0021 11 9 9 0 0012 3z" />
      <Circle cx={7.5} cy={11} r={1.2} fill={stroke} stroke="none" />
      <Circle cx={11} cy={7} r={1.2} fill={stroke} stroke="none" />
      <Circle cx={16} cy={8} r={1.2} fill={stroke} stroke="none" />
    </>,
    percent: <><Circle cx={7} cy={7} r={2.5} /><Circle cx={17} cy={17} r={2.5} /><Path d="M5 19L19 5" /></>,
    folder: <Path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />,
    help: <><Circle cx={12} cy={12} r={8} /><Path d="M9.5 9.5a2.5 2.5 0 015 0c0 1.7-2.5 2-2.5 4" /><Circle cx={12} cy={17} r={0.7} fill={stroke} stroke="none" /></>,
    mail: <><Rect x={3} y={6} width={18} height={12} rx={2} /><Path d="M3.5 7l8.5 6.5L20.5 7" /></>,
    doc: <><Path d="M6 3h9l4 4v14a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" /><Path d="M14 3v4h5" /></>,
    shield: <Path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />,
    info: <><Circle cx={12} cy={12} r={8} /><Path d="M12 11v5M12 8h0" /></>,
    crown: <Path d="M3 7l4 4 5-7 5 7 4-4-2 12H5L3 7z" />,
    close: <Path d="M6 6l12 12M18 6l-12 12" />,
    closeCircle: <>
      <Circle cx={12} cy={12} r={9} fill="rgba(0,0,0,0.55)" stroke="none" />
      <Path d="M9 9l6 6M15 9l-6 6" stroke="#fff" />
    </>,
    helpCircle: <><Circle cx={12} cy={12} r={8} /><Path d="M10 10a2 2 0 014 0c0 1.3-2 1.5-2 3M12 16h0" /></>,
  };

  return <Svg {...common}>{paths[name]}</Svg>;
}
