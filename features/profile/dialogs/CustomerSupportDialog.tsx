import useI18n from "@/shared/hooks/useI18n";
import useDialogStore from "@/shared/stores/useDialogStore";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import * as Sentry from "@sentry/react-native";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { profileStyles } from "../styles";
import { CustomerSupportDialogProps } from "../types";

interface CustomerSupportDialogComponentProps
  extends CustomerSupportDialogProps {
  _dialogId?: string;
}

export const CustomerSupportDialog: React.FC<
  CustomerSupportDialogComponentProps
> = ({ userId, userEmail, appVersion, buildNumber, _dialogId }) => {
  const { t } = useI18n();
  const closeDialog = useDialogStore((s) => s.closeDialog);

  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<"bug" | "feature" | "general">(
    "general"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert(t("common.error"), t("profile.support.message-required"));
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate a unique support ticket ID for tracking
      const ticketId = `support_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create comprehensive Sentry issue with enhanced context
      const sentryEventId = Sentry.withScope((scope) => {
        // Set user information
        scope.setUser({
          id: userId,
          email: userEmail,
        });

        // Set tags for filtering and organization
        scope.setTag("support_request", true);
        scope.setTag("category", category);
        scope.setTag("ticket_id", ticketId);
        scope.setTag("app_version", appVersion);
        scope.setTag("build_number", buildNumber);

        // Set level based on category
        const level = category === "bug" ? "error" : "info";
        scope.setLevel(level);

        // Add comprehensive context
        scope.setContext("app_info", {
          version: appVersion,
          buildNumber: buildNumber,
          platform: "mobile",
          environment: __DEV__ ? "development" : "production",
        });

        scope.setContext("support_request", {
          ticketId,
          category,
          message: message.trim(),
          timestamp: new Date().toISOString(),
          userEmail,
          userId,
        });

        scope.setContext("user_context", {
          userId,
          email: userEmail,
          submissionTime: new Date().toISOString(),
        });

        // Capture the message with appropriate level
        const eventId = Sentry.captureMessage(
          `[${category.toUpperCase()}] Support Request: ${message.substring(0, 100)}${message.length > 100 ? "..." : ""}`,
          level
        );

        return eventId;
      });

      // Use Sentry User Feedback API for better integration
      if (sentryEventId) {
        Sentry.captureUserFeedback({
          event_id: sentryEventId,
          name: userEmail?.split("@")[0] || "User",
          email: userEmail || "no-email@example.com",
          comments: `[${category.toUpperCase()}] ${message.trim()}`,
        });
      }

      // Also log to our internal error handler for tracking
      GlobalErrorHandler.logError(
        new Error(`Support request: ${category} - ${ticketId}`),
        "CUSTOMER_SUPPORT_REQUEST",
        {
          ticketId,
          userId,
          email: userEmail,
          message: message.trim(),
          category,
          appVersion,
          buildNumber,
          sentryEventId,
          timestamp: new Date().toISOString(),
        }
      );

      // Provide haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Show success message with ticket ID for reference
      Alert.alert(
        t("profile.support.success"),
        `${t("profile.support.success-message")}\n\nTicket ID: ${ticketId}`,
        [
          {
            text: t("common.ok"),
            onPress: () => {
              // Reset form
              setMessage("");
              setCategory("general");

              if (_dialogId) {
                closeDialog(_dialogId);
              }
            },
          },
        ]
      );
    } catch (error) {
      // Enhanced error logging
      GlobalErrorHandler.logError(error, "SUPPORT_REQUEST_FAILED", {
        userId,
        category,
        messageLength: message.length,
        userEmail,
        appVersion,
        buildNumber,
      });

      // Provide haptic feedback for error
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      Alert.alert(t("common.error"), t("profile.support.error-message"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { key: "general", label: t("profile.support.general") },
    { key: "bug", label: t("profile.support.bug") },
    { key: "feature", label: t("profile.support.feature") },
  ] as const;

  return (
    <View style={profileStyles.supportFormContainer}>
      <Text style={profileStyles.fieldLabel}>
        {t("profile.support.category")}
      </Text>

      <View style={profileStyles.categorySelector}>
        {categories.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[
              profileStyles.categoryButton,
              category === key && profileStyles.categoryButtonActive,
            ]}
            onPress={() => setCategory(key)}
          >
            <Text
              style={[
                profileStyles.categoryButtonText,
                category === key && profileStyles.categoryButtonTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={profileStyles.fieldLabel}>
        {t("profile.support.message")}
      </Text>

      <TextInput
        style={profileStyles.messageInput}
        multiline
        placeholder={t("profile.support.message-placeholder")}
        value={message}
        onChangeText={setMessage}
        editable={!isSubmitting}
        maxLength={1000}
      />

      <Text
        style={[
          profileStyles.fieldLabel,
          { textAlign: "right", fontSize: 12, marginBottom: 16 },
        ]}
      >
        {message.length}/1000
      </Text>

      <TouchableOpacity
        style={[
          profileStyles.submitButton,
          (isSubmitting || !message.trim()) &&
            profileStyles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={isSubmitting || !message.trim()}
      >
        <Text style={profileStyles.submitButtonText}>
          {isSubmitting ? t("common.submitting") : t("profile.support.submit")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
