// Jest setup file
import "react-native-gesture-handler/jestSetup";

// Mock expo-constants
jest.mock("expo-constants", () => ({
  expoConfig: {
    extra: {
      EXPO_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
      EXPO_PUBLIC_SUPABASE_KEY: "test-key",
      EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: "test-clerk-key",
    },
  },
}));

// Mock expo-secure-store
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock React Native modules
jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native");
  return {
    ...RN,
    Platform: {
      ...RN.Platform,
      OS: "ios",
      select: jest.fn((obj) => obj.ios || obj.default),
    },
    Alert: {
      alert: jest.fn(),
    },
  };
});

// Global test utils
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Set default timeout
jest.setTimeout(30000);
