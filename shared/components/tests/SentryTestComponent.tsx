/**
 * Example component demonstrating Sentry integration with GlobalErrorHandler
 * This file can be deleted after verification - it's just for testing
 */
import { useErrorHandler } from "@/shared/utils/errorHandler";
import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

export function SentryTestComponent() {
  const { logError, logWarning, logDebug, setUserContext, addBreadcrumb } =
    useErrorHandler();

  const testErrorLogging = () => {
    // Test error logging
    logError(
      new Error("Test error for Sentry integration"),
      "SentryTestComponent.testErrorLogging",
      {
        testData: "This is test data",
        timestamp: Date.now(),
      }
    );
  };

  const testWarningLogging = () => {
    // Test warning logging
    logWarning(
      "This is a test warning message",
      "SentryTestComponent.testWarningLogging",
      {
        warningType: "test",
        severity: "low",
      }
    );
  };

  const testBreadcrumbs = () => {
    // Test breadcrumb logging
    addBreadcrumb(
      "User clicked test breadcrumb button",
      "user-interaction",
      "info",
      {
        buttonId: "test-breadcrumb",
        componentName: "SentryTestComponent",
      }
    );
    logDebug("Breadcrumb added successfully");
  };

  const testUserContext = () => {
    // Test setting user context
    setUserContext({
      id: "test-user-123",
      email: "test@example.com",
      username: "testuser",
    });
    logDebug("User context set successfully");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔧 Sentry Integration Test</Text>
        <Text style={styles.subtitle}>
          Test the GlobalErrorHandler integration with Sentry. In development,
          errors will be logged to console. In production, they'll be sent to
          Sentry.
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.errorButton]}
          onPress={testErrorLogging}
        >
          <Text style={styles.buttonText}>🚨 Test Error Logging</Text>
          <Text style={styles.buttonDescription}>Logs a test error</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.warningButton]}
          onPress={testWarningLogging}
        >
          <Text style={styles.buttonText}>⚠️ Test Warning Logging</Text>
          <Text style={styles.buttonDescription}>Logs a test warning</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.breadcrumbButton]}
          onPress={testBreadcrumbs}
        >
          <Text style={styles.buttonText}>🍞 Test Breadcrumbs</Text>
          <Text style={styles.buttonDescription}>
            Adds debugging breadcrumbs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.userButton]}
          onPress={testUserContext}
        >
          <Text style={styles.buttonText}>👤 Test User Context</Text>
          <Text style={styles.buttonDescription}>
            Sets user context for errors
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  header: {
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    lineHeight: 20,
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  buttonDescription: {
    fontSize: 12,
    textAlign: "center",
    color: "#666",
  },
  errorButton: {
    borderLeftWidth: 4,
    borderLeftColor: "#dc3545",
  },
  warningButton: {
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
  },
  breadcrumbButton: {
    borderLeftWidth: 4,
    borderLeftColor: "#17a2b8",
  },
  userButton: {
    borderLeftWidth: 4,
    borderLeftColor: "#28a745",
  },
  buttonContainer: {
    marginVertical: 8,
  },
});
