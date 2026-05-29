import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// TODO(release): 本番のバナーユニットIDに差し替える（現状はGoogleテストID）
const BANNER_UNIT_ID = TestIds.BANNER;

export function AdBannerNative() {
  return (
    <View style={styles.wrap}>
      <BannerAd unitId={BANNER_UNIT_ID} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 8 },
});
