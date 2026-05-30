import React from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';
import { useTranslation } from '@/i18n';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { colors } from '@/theme/tokens';

const { width: W } = Dimensions.get('window');

type Slide = { key: string; illustration: React.ReactNode; title: string; sub: string };

function IllustrationHome() {
  return (
    <Svg width={260} height={220} viewBox="0 0 260 220">
      {/* House body */}
      <Path d="M50 120 L50 200 L210 200 L210 120" fill={colors.primarySoft} stroke={colors.primary} strokeWidth={2.5} strokeLinejoin="round" />
      {/* Roof */}
      <Path d="M30 125 L130 45 L230 125" fill="none" stroke={colors.primary} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
      {/* Door */}
      <Rect x={108} y={155} width={44} height={45} rx={6} fill={colors.primary} opacity={0.18} stroke={colors.primary} strokeWidth={1.5} />
      {/* Window */}
      <Rect x={62} y={140} width={36} height={30} rx={5} fill={colors.primary} opacity={0.18} stroke={colors.primary} strokeWidth={1.5} />
      <Rect x={162} y={140} width={36} height={30} rx={5} fill={colors.primary} opacity={0.18} stroke={colors.primary} strokeWidth={1.5} />

      {/* Floating item: book (top-left) */}
      <Rect x={12} y={60} width={34} height={42} rx={4} fill="#FDE68A" stroke="#F59E0B" strokeWidth={1.5} />
      <Line x1={18} y1={72} x2={40} y2={72} stroke="#F59E0B" strokeWidth={1.2} />
      <Line x1={18} y1={80} x2={40} y2={80} stroke="#F59E0B" strokeWidth={1.2} />
      <Line x1={18} y1={88} x2={34} y2={88} stroke="#F59E0B" strokeWidth={1.2} />

      {/* Floating item: price tag (top-right) */}
      <Path d="M210 30 L240 30 L248 52 L225 68 L202 52 Z" fill="#D1FAE5" stroke="#10B981" strokeWidth={1.5} strokeLinejoin="round" />
      <Circle cx={224} cy={40} r={3.5} fill="#10B981" />
      <Line x1={215} y1={52} x2={237} y2={52} stroke="#10B981" strokeWidth={1.2} />
      <Line x1={220} y1={59} x2={232} y2={59} stroke="#10B981" strokeWidth={1.2} />

      {/* Floating item: camera (right) */}
      <Rect x={218} y={100} width={38} height={28} rx={5} fill="#EDE9FE" stroke="#7C3AED" strokeWidth={1.5} />
      <Circle cx={237} cy={114} r={7} fill="none" stroke="#7C3AED" strokeWidth={1.5} />
      <Circle cx={237} cy={114} r={3} fill="#7C3AED" opacity={0.5} />
      <Rect x={224} y={103} width={8} height={4} rx={2} fill="#7C3AED" opacity={0.5} />

      {/* Ground line */}
      <Line x1={20} y1={200} x2={240} y2={200} stroke={colors.primary} strokeWidth={1.5} opacity={0.3} />
    </Svg>
  );
}

function IllustrationTrack() {
  return (
    <Svg width={280} height={220} viewBox="0 0 280 220">
      {/* Phone */}
      <Rect x={20} y={40} width={70} height={120} rx={12} fill={colors.primarySoft} stroke={colors.primary} strokeWidth={2} />
      <Rect x={28} y={55} width={54} height={46} rx={4} fill={colors.primary} opacity={0.15} />
      {/* Camera icon on phone */}
      <Circle cx={55} cy={78} r={12} fill="none" stroke={colors.primary} strokeWidth={1.8} />
      <Circle cx={55} cy={78} r={5} fill={colors.primary} opacity={0.4} />
      <Rect x={62} y={60} width={7} height={4} rx={2} fill={colors.primary} opacity={0.5} />
      {/* Phone bottom dots */}
      <Circle cx={55} cy={148} r={5} fill={colors.primary} opacity={0.25} />

      {/* Arrow 1 */}
      <Path d="M96 100 L116 100" stroke={colors.primary} strokeWidth={2} strokeLinecap="round" />
      <Path d="M110 94 L118 100 L110 106" fill="none" stroke={colors.primary} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

      {/* Price tag card */}
      <Rect x={118} y={68} width={62} height={64} rx={10} fill="#fff" stroke={colors.primary} strokeWidth={1.8} />
      <Path d="M130 85 L167 85" stroke={colors.primary} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M130 95 L157 95" stroke={colors.primary} strokeWidth={1} strokeLinecap="round" opacity={0.5} />
      {/* Price highlight */}
      <Rect x={128} y={104} width={46} height={18} rx={5} fill={colors.primarySoft} />
      <Path d="M133 113 L167 113" stroke={colors.primary} strokeWidth={1.8} strokeLinecap="round" />

      {/* Arrow 2 */}
      <Path d="M186 100 L206 100" stroke={colors.profit} strokeWidth={2} strokeLinecap="round" />
      <Path d="M200 94 L208 100 L200 106" fill="none" stroke={colors.profit} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

      {/* Total card */}
      <Rect x={208} y={55} width={62} height={90} rx={10} fill="#fff" stroke={colors.profit} strokeWidth={2} />
      <Path d="M218 75 L260 75" stroke={colors.ink3} strokeWidth={1} strokeLinecap="round" />
      <Path d="M218 85 L255 85" stroke={colors.ink3} strokeWidth={1} strokeLinecap="round" />
      <Path d="M218 95 L258 95" stroke={colors.ink3} strokeWidth={1} strokeLinecap="round" />
      {/* Divider */}
      <Line x1={215} y1={106} x2={263} y2={106} stroke={colors.divider} strokeWidth={1} />
      {/* Total value */}
      <Path d="M218 118 L262 118" stroke={colors.profit} strokeWidth={2.5} strokeLinecap="round" />
      <Circle cx={225} cy={130} r={0} />

      {/* Sigma symbol area */}
      <Ellipse cx={239} cy={128} rx={14} ry={9} fill="#D1FAE5" />
      <Path d="M232 124 L232 132 L246 132" fill="none" stroke={colors.profit} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />

      {/* Label: Total */}
      <Rect x={220} y={138} width={40} height={6} rx={3} fill={colors.profit} opacity={0.2} />
    </Svg>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
  const flatRef = React.useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const slides: Slide[] = [
    {
      key: 'welcome',
      illustration: <IllustrationHome />,
      title: t('onboarding.slide1Title'),
      sub: t('onboarding.slide1Sub'),
    },
    {
      key: 'track',
      illustration: <IllustrationTrack />,
      title: t('onboarding.slide2Title'),
      sub: t('onboarding.slide2Sub'),
    },
  ];

  const finish = () => {
    completeOnboarding();
    router.replace('/add?from=onboarding');
  };

  const skip = () => {
    completeOnboarding();
    router.replace('/home');
  };

  const onViewableItemsChanged = React.useRef(
    ({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
      if (viewableItems[0]?.index != null) setActiveIndex(viewableItems[0].index);
    }
  ).current;

  const renderItem = ({ item }: ListRenderItemInfo<Slide>) => (
    <View style={[styles.slide, { width: W }]}>
      <View style={styles.illustrationWrap}>{item.illustration}</View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.sub}>{item.sub}</Text>
    </View>
  );

  const isLast = activeIndex === slides.length - 1;

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom + 24, paddingTop: insets.top + 8 }]}>
      {/* Skip */}
      <Pressable style={styles.skipBtn} onPress={skip} hitSlop={12}>
        <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
      </Pressable>

      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        style={{ flex: 1 }}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>

      {/* CTA */}
      <Pressable
        style={({ pressed }) => [styles.ctaBtn, pressed && styles.ctaBtnPressed]}
        onPress={isLast ? finish : () => flatRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true })}
      >
        <Text style={styles.ctaText}>
          {isLast ? t('onboarding.cta') : t('onboarding.next')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', alignItems: 'center' },

  skipBtn: { alignSelf: 'flex-end', paddingHorizontal: 20, paddingVertical: 8 },
  skipText: { fontSize: 15, color: colors.ink3, fontWeight: '500' },

  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 24 },
  illustrationWrap: { marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: colors.ink1, textAlign: 'center', letterSpacing: -0.5, lineHeight: 34 },
  sub: { fontSize: 15, color: colors.ink2, textAlign: 'center', lineHeight: 23 },

  dots: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  dot: { width: 7, height: 7, borderRadius: 99, backgroundColor: colors.divider },
  dotActive: { width: 22, backgroundColor: colors.primary },

  ctaBtn: { marginHorizontal: 24, width: W - 48, backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  ctaBtnPressed: { opacity: 0.85 },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
