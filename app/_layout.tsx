import { SECRETS } from "@/shared/constants/SECRETS";
import {
  EncryptionProvider,
  NetworkProvider,
  OnboardingProvider,
} from "@/shared/context";
import { ToastProvider } from "@/shared/context/ToastProvider";
import { useColorScheme } from "@/shared/hooks/useColorScheme";
import { getIsDev } from "@/shared/hooks/useDev";
import i18n from "@/shared/locales";
import { NotificationProvider } from "@/shared/notifications";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PostHogProvider } from "posthog-react-native";
import { I18nextProvider } from "react-i18next";
import { Platform, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Logger } from "../shared/utils/errorHandler";

if (
  SECRETS.EXPO_PUBLIC_SENTRY_DSN &&
  SECRETS.EXPO_PUBLIC_SENTRY_DSN.length > 0
) {
  // Initialize Sentry
  Sentry.init({
    dsn: SECRETS.EXPO_PUBLIC_SENTRY_DSN,

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
        Logger.logDebug("Sentry Event Captured", "SENTRY_EVENT", event);
      }
      return event;
    },

    // Performance monitoring
    tracesSampleRate: getIsDev() ? 1.0 : 0.1, // 100% in dev, 10% in prod

    // Additional configuration for production
    attachScreenshot: true, // Attach screenshots on errors
    attachViewHierarchy: true, // Attach view hierarchy on errors
  });
  Logger.logDebug("Sentry initialized", "SENTRY_INIT");
} else {
  Logger.logWarning(
    "Sentry DSN is not set or invalid. Sentry is disabled.",
    "SENTRY_INIT",
    { message: SECRETS.EXPO_PUBLIC_SENTRY_DSN }
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

const RootLayout = function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    // Register FoundersGrotesk family used across the app
    "FoundersGrotesk-Regular": require("../assets/fonts/FoundersGrotesk-Regular-BF66175e972ac1c.otf"),
    "FoundersGrotesk-Medium": require("../assets/fonts/FoundersGrotesk-Medium-BF66175e972d694.otf"),
    "FoundersGrotesk-Semibold": require("../assets/fonts/FoundersGrotesk-Semibold-BF66175e972c958.otf"),
    "FoundersGrotesk-Bold": require("../assets/fonts/FoundersGrotesk-Bold-BF66175e9700615.otf"),
    "Graphik-Regular": require("../assets/fonts/Graphik-Regular.otf"),
    "Graphik-Semibold": require("../assets/fonts/Graphik-Semibold.otf"),
    "Graphik-Bold": require("../assets/fonts/Graphik-Bold.otf"),
    "Graphik-Extralight": require("../assets/fonts/Graphik-Extralight.otf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  // PostHog should only initialize on native platforms, not during web SSR
  const shouldUsePostHog =
    Platform.OS !== "web" &&
    SECRETS.EXPO_PUBLIC_POSTHOG_KEY &&
    SECRETS.EXPO_PUBLIC_POSTHOG_HOST;

  const content = (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <I18nextProvider i18n={i18n}>
          <NetworkProvider>
            <EncryptionProvider>
              <ToastProvider>
                <ClerkProvider
                  publishableKey={SECRETS.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
                  tokenCache={tokenCache}
                >
                  <OnboardingProvider>
                    <NotificationProvider>
                      <Slot />
                    </NotificationProvider>
                  </OnboardingProvider>
                </ClerkProvider>
              </ToastProvider>
            </EncryptionProvider>
          </NetworkProvider>
          <StatusBar style="auto" />
        </I18nextProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );

  if (shouldUsePostHog) {
    return (
      <PostHogProvider
        apiKey={SECRETS.EXPO_PUBLIC_POSTHOG_KEY!}
        options={{ host: SECRETS.EXPO_PUBLIC_POSTHOG_HOST! }}
      >
        {content}
      </PostHogProvider>
    );
  }

  return content;
};

export default Sentry.getClient() ? Sentry.wrap(RootLayout) : RootLayout;
