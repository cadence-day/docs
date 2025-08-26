const path = require("path");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getSentryExpoConfig(__dirname);

// Add support for TypeScript path mapping
config.resolver.alias = {
  "@": path.resolve(__dirname, "./"),
};

// Ensure proper handling of TypeScript files
config.resolver.sourceExts.push("ts", "tsx");

module.exports = config;
