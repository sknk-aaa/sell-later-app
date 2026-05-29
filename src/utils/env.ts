import Constants from 'expo-constants';

// Expo Go ではネイティブモジュール(課金/広告)が使えないため判定に使う
export const isExpoGo = Constants.executionEnvironment === 'storeClient';
