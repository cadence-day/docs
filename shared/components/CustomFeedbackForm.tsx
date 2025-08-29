import { useErrorHandler } from "@/shared/utils/errorHandler";
import * as Sentry from "@sentry/react-native";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface FeedbackData {
  name?: string;
  email?: string;
  message: string;
}

interface CustomFeedbackFormProps {
  onClose?: () => void;
  onSubmit?: () => void;
}

export function CustomFeedbackForm({
  onClose,
  onSubmit,
}: CustomFeedbackFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { logDebug, logError } = useErrorHandler();

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert(
        "Missing Information",
        "Please enter a message before submitting."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      logDebug(
        "User submitting custom feedback",
        "CustomFeedbackForm.handleSubmit",
        {
          hasName: !!name.trim(),
          hasEmail: !!email.trim(),
          messageLength: message.length,
        }
      );

      // Submit feedback to Sentry
      const feedbackData: FeedbackData = {
        message: message.trim(),
      };

      // Only include name and email if provided
      if (name.trim()) {
        feedbackData.name = name.trim();
      }
      if (email.trim()) {
        feedbackData.email = email.trim();
      }

      await Sentry.captureFeedback(feedbackData);

      Alert.alert(
        "Feedback Sent! 🎉",
        "Thank you for your feedback. It helps us improve the app!",
        [
          {
            text: "OK",
            onPress: () => {
              // Clear form
              setName("");
              setEmail("");
              setMessage("");
              onSubmit?.();
            },
          },
        ]
      );
    } catch (error) {
      logError(error, "CustomFeedbackForm.handleSubmit");
      Alert.alert(
        "Error",
        "Unable to send feedback. Please try again or use the built-in feedback widget."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>💬 Send Feedback</Text>
          <Text style={styles.subtitle}>
            Help us improve the app by sharing your thoughts, suggestions, or
            reporting issues.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              textContentType="name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="your.email@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              textContentType="emailAddress"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Message *</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Tell us what happened. What did you expect? Any suggestions for improvement?"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                isSubmitting && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? "Sending..." : "Send Feedback"}
              </Text>
            </TouchableOpacity>

            {onClose && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  messageInput: {
    height: 120,
    textAlignVertical: "top",
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 6,
  },
  submitButton: {
    backgroundColor: "#007bff",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
