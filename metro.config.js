const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Drizzle のマイグレーション (.sql) を inline-import で取り込むため
config.resolver.sourceExts.push('sql');

module.exports = config;
