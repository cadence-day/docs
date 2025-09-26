import { NetworkProvider } from "@/shared/context";
import i18n from "@/shared/locales";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { revenueCatService } from "@/features/purchases";
import { SECRETS } from "@/shared/constants/SECRETS";
import { ToastProvider } from "@/shared/context/ToastProvider";
import { useColorScheme } from "@/shared/hooks/useColorScheme";
import { getIsDev } from "@/shared/hooks/useDev";
import { NotificationProvider } from "@/shared/notifications";
import * as Sentry from "@sentry/react-native";
import { GlobalErrorHandler } from "../shared/utils/errorHandler";

// Initialize Sentry
Sentry.init({
  dsn:
    SECRETS.EXPO_PUBLIC_SENTRY_DSN ||
    "https://d384058e537f40c0fe106ce0788f47ae@o4509604790861824.ingest.de.sentry.io/4509910821240912",

  // Enable Sentry in all environments for proper testing
  enabled: true,

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1, // 10% in both dev and prod for testing
  replaysOnErrorSampleRate: 1.0, // 100% replay on errors

  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration({
      // Customize the feedback widget
      styles: {
        submitButton: {
          backgroundColor: "#007bff",
        },
      },
      namePlaceholder: "Your name (optional)",
      emailPlaceholder: "Your email (optional)",
      messagePlaceholder: "Tell us what happened. What did you expect?",
      submitButtonLabel: "Send Feedback",
      cancelButtonLabel: "Cancel",
    }),
  ],

  // Enable Spotlight in development
  spotlight: getIsDev(),

  // Set app context
  environment: getIsDev() ? "development" : "production",

  // App release information
  release: `cadence-app@2.0.0`,
  dist: getIsDev() ? "dev" : "prod",

  // Configure error filtering and sampling
  beforeSend(event) {
    // In development, you might want to log to console as well
    if (getIsDev()) {
      GlobalErrorHandler.logDebug(
        "Sentry Event Captured",
        "SENTRY_EVENT",
        event
      );
    }
    return event;
  },

  // Performance monitoring
  tracesSampleRate: getIsDev() ? 1.0 : 0.1, // 100% in dev, 10% in prod

  // Additional configuration for production
  attachScreenshot: true, // Attach screenshots on errors
  attachViewHierarchy: true, // Attach view hierarchy on errors
});

export default Sentry.wrap(function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    // Register FoundersGrotesk family used across the app
    "FoundersGrotesk-Regular": require("../assets/fonts/FoundersGrotesk-Regular-BF66175e972ac1c.otf"),
    "FoundersGrotesk-Medium": require("../assets/fonts/FoundersGrotesk-Medium-BF66175e972d694.otf"),
    "FoundersGrotesk-Semibold": require("../assets/fonts/FoundersGrotesk-Semibold-BF66175e972c958.otf"),
    "FoundersGrotesk-Bold": require("../assets/fonts/FoundersGrotesk-Bold-BF66175e9700615.otf"),
  });

  // Initialize RevenueCat on app startup
  useEffect(() => {
    const initializeRevenueCat = async () => {
      try {
        await revenueCatService.configure();
        GlobalErrorHandler.logDebug(
          "RevenueCat configured successfully",
          "REVENUECAT_INIT"
        );
      } catch (error) {
        GlobalErrorHandler.logError(error, "Failed to initialize RevenueCat");
      }
    };

    initializeRevenueCat();
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <I18nextProvider i18n={i18n}>
          <NetworkProvider>
            <ToastProvider>
              <ClerkProvider
                publishableKey={SECRETS.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
                tokenCache={tokenCache}
              >
                <NotificationProvider>
                  <Slot />
                </NotificationProvider>
              </ClerkProvider>
            </ToastProvider>
          </NetworkProvider>
          <StatusBar style="auto" />
        </I18nextProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
});
