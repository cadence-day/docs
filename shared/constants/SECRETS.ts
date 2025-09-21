/**
 * Environment configuration and secrets
 * Populated by Doppler in production/staging or .env.development for local dev
 */
export const SECRETS = {
  // Supabase
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_KEY: process.env.EXPO_PUBLIC_SUPABASE_KEY,

  // Clerk Authentication
  EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,

  // Sentry
  EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,

  // Expo Notifications
  EXPO_PROJECT_ID: process.env.EXPO_PROJECT_ID,

  // RevenueCat
  EXPO_PUBLIC_REVENUECAT_IOS_API_KEY:
    process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
  EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY:
    process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
} as const;

// Type guard to ensure required secrets are present
export const validateRequiredSecrets = () => {
  const required = [
    "EXPO_PUBLIC_SUPABASE_URL",
    "EXPO_PUBLIC_SUPABASE_KEY",
    "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY",
  ] as const;

  const missing = required.filter((key) => !SECRETS[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
};
