import { config as dotenvConfig } from "dotenv";
import path from "path";

// Load environment-specific .env file
const envFile =
  process.env.NODE_ENV === "development" ? ".env.development" : ".env";
dotenvConfig({ path: path.resolve(__dirname, envFile) });

export default ({ config }) => ({
  ...config,
  expo: {
    ...config.expo,
    name: "Cadence.day",
    slug: "cadenceMobileSandbox",
    version: "2.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "day.cadence",
    deepLinking: true,
    userInterfaceStyle: "automatic",
    newArchEnabled: false,
    description: "A mobile app for recording daily activities and reflections",
    privacy: "unlisted",
    ios: {
      supportsTablet: false,
      bundleIdentifier: "day.cadence.mobile",
      associatedDomains: ["applinks:app.cadence.day"],
      usesAppleSignIn: true,
      icon: {
        dark: "./assets/images/ios-dark.png",
        light: "./assets/images/ios-light.png",
        tinted: "./assets/images/ios-tinted.png",
      },
      config: {
        usesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/splash-icon.png",
        backgroundColor: "#ffffff",
      },
      icon: "./assets/images/icon.png",
      package: "day.cadence.mobile",
      intentFilters: [
        {
          action: "VIEW",
          data: {
            scheme: "https",
            host: "app.cadence.day",
            pathPrefix: "/",
          },
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    plugins: [
      "expo-router",
      "expo-web-browser",
      "expo-secure-store",
      [
        "expo-apple-authentication"
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "92faf751-dafb-48d3-b8a4-86a6a222f550",
      },
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_KEY: process.env.EXPO_PUBLIC_SUPABASE_KEY,
      EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
      EXPO_PUBLIC_LANGGRAPH_API_URL: process.env.EXPO_PUBLIC_LANGGRAPH_API_URL,
      EXPO_PUBLIC_LANGGRAPH_ASSISTANT_ID:
        process.env.EXPO_PUBLIC_LANGGRAPH_ASSISTANT_ID,
      LANGGRAPH_URL: process.env.LANGGRAPH_URL,
      LANGGRAPH_API_KEY: process.env.LANGGRAPH_API_KEY,
      GROQ_API_KEY: process.env.GROQ_API_KEY,
      EXPO_MISTRAL_API_KEY: process.env.EXPO_MISTRAL_API_KEY,
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: "https://u.expo.dev/92faf751-dafb-48d3-b8a4-86a6a222f550",
    },
    owner: "cadencedotday",
  },
});
