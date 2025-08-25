const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for TypeScript path mapping
config.resolver.alias = {
  '@': path.resolve(__dirname, './'),
};

// Ensure proper handling of TypeScript files
config.resolver.sourceExts.push('ts', 'tsx');

module.exports = config;
