// Moved from app/(home)/settings/index.tsx
import { useErrorHandler } from "@/shared/utils/errorHandler";
import * as Sentry from "@sentry/react-native";
import { FeedbackWidget } from "@sentry/react-native";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsPage() {
  const { logDebug } = useErrorHandler();
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [showFeedbackWidget, setShowFeedbackWidget] = useState(false);
  const router = useRouter();

  const showSentryFeedbackWidget = () => {
    try {
      logDebug(
        "User requested feedback widget",
        "SettingsPage.showSentryFeedbackWidget"
      );
      Sentry.showFeedbackWidget();
    } catch (error) {
      Alert.alert("Error", "Unable to show feedback widget. Please try again.");
      console.error("Error showing feedback widget:", error);
    }
  };

  const showSentryFeedbackButton = () => {
    try {
      logDebug(
        "User enabled feedback button",
        "SettingsPage.showSentryFeedbackButton"
      );
      // Sentry React Native SDK does not expose showFeedbackButton(); emulate via local state.
      setFeedbackVisible(true);
      Alert.alert(
        "Feedback Button Enabled",
        "A floating feedback button has been enabled in the app (local)."
      );
    } catch (error) {
      Alert.alert("Error", "Unable to show feedback button. Please try again.");
      console.error("Error showing feedback button:", error);
    }
  };

  const hideSentryFeedbackButton = () => {
    try {
      logDebug(
        "User disabled feedback button",
        "SettingsPage.hideSentryFeedbackButton"
      );
      // Sentry React Native SDK does not expose hideFeedbackButton(); hide the local floating button instead.
      setFeedbackVisible(false);
      Alert.alert(
        "Feedback Button Hidden",
        "The floating feedback button has been removed from your screen."
      );
    } catch (error) {
      Alert.alert("Error", "Unable to hide feedback button. Please try again.");
      console.error("Error hiding feedback button:", error);
    }
  };

  const navigateToCustomFeedback = () => {
    router.push("/custom-feedback");
  };

  const toggleFeedbackWidget = () => {
    setShowFeedbackWidget(!showFeedbackWidget);
    logDebug(
      `Feedback widget ${showFeedbackWidget ? "hidden" : "shown"}`,
      "SettingsPage.toggleFeedbackWidget"
    );
  };

  const testCustomFeedback = () => {
    try {
      logDebug(
        "User submitted custom feedback",
        "SettingsPage.testCustomFeedback"
      );

      // Example of custom feedback submission
      const userFeedback = {
        name: "Test User",
        email: "test@example.com",
        message: "This is a test feedback submission from the settings page!",
      };

      Sentry.captureFeedback(userFeedback);
      Alert.alert(
        "Feedback Sent",
        "Your test feedback has been sent to Sentry successfully!"
      );
    } catch (error) {
      Alert.alert("Error", "Unable to send custom feedback. Please try again.");
      console.error("Error sending custom feedback:", error);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
          headerShown: true,
          // Provide an explicit Home button so users can come back to the root screen
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push("/")}
              style={{ paddingHorizontal: 12 }}
            >
              <Text style={{ color: "#007bff", fontSize: 16 }}>Home</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 App Settings</Text>
          <Text style={styles.sectionDescription}>
            Configure your app preferences and feedback options.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 User Feedback</Text>
          <Text style={styles.sectionDescription}>
            Help us improve the app by providing feedback through Sentry's
            feedback system.
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={showSentryFeedbackWidget}
          >
            <Text style={styles.primaryButtonText}>
              📝 Send Feedback (Native)
            </Text>
            <Text style={styles.buttonDescription}>
              Open Sentry's built-in feedback form
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={navigateToCustomFeedback}
          >
            <Text style={styles.primaryButtonText}>
              📝 Send Feedback (Custom)
            </Text>
            <Text style={styles.buttonDescription}>
              Open custom feedback form
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={toggleFeedbackWidget}
          >
            <Text style={styles.secondaryButtonText}>
              {showFeedbackWidget
                ? "🚫 Hide Widget Component"
                : "📋 Show Widget Component"}
            </Text>
            <Text style={styles.buttonDescription}>
              {showFeedbackWidget
                ? "Hide embedded feedback widget"
                : "Show embedded feedback widget below"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={
              feedbackVisible
                ? hideSentryFeedbackButton
                : showSentryFeedbackButton
            }
          >
            <Text style={styles.secondaryButtonText}>
              {feedbackVisible
                ? "🚫 Hide Floating Button"
                : "🔘 Show Floating Button"}
            </Text>
            <Text style={styles.buttonDescription}>
              {feedbackVisible
                ? "Remove floating feedback button"
                : "Add floating feedback button to screen"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.tertiaryButton]}
            onPress={testCustomFeedback}
          >
            <Text style={styles.tertiaryButtonText}>
              🧪 Test Custom Feedback
            </Text>
            <Text style={styles.buttonDescription}>
              Send sample feedback via API
            </Text>
          </TouchableOpacity>
        </View>

        {/* Embedded Feedback Widget */}
        {showFeedbackWidget && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Embedded Feedback Widget</Text>
            <Text style={styles.sectionDescription}>
              This is Sentry's FeedbackWidget component embedded directly in the
              page.
            </Text>
            <View style={styles.widgetContainer}>
              <FeedbackWidget />
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Development Tools</Text>
          <Text style={styles.sectionDescription}>
            Tools for testing and debugging the application.
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.debugButton]}
            onPress={() => {
              // Navigate to Sentry test page - you could use router.push here
              Alert.alert(
                "Debug Tools",
                "Sentry test page can be accessed from the home screen."
              );
            }}
          >
            <Text style={styles.debugButtonText}>
              🔧 Sentry Integration Test
            </Text>
            <Text style={styles.buttonDescription}>
              Test error logging and monitoring
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ About</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Version:</Text>
            <Text style={styles.infoValue}>2.0.0</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Environment:</Text>
            <Text style={styles.infoValue}>
              {__DEV__ ? "Development" : "Production"}
            </Text>
          </View>
        </View>

        {/* Add some bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
  },
  button: {
    padding: 16,
    borderRadius: 10,
    marginVertical: 6,
  },
  primaryButton: {
    backgroundColor: "#007bff",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  secondaryButton: {
    backgroundColor: "#6c757d",
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  tertiaryButton: {
    backgroundColor: "#17a2b8",
  },
  tertiaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  debugButton: {
    backgroundColor: "#ffc107",
  },
  debugButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  buttonDescription: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.8,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  bottomPadding: {
    height: 40,
  },
  widgetContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
});
