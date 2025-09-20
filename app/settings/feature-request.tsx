import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { profileStyles } from "@/features/profile/styles";
import { COLORS } from "@/shared/constants/COLORS";
import { CdButton } from "../../shared/components";

const FeatureRequestScreen = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);

  const { user } = useUser();
  const appVersion = Constants.expoConfig?.version || "Unknown";

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Error", "Please fill in both title and description");
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Create comprehensive context for Sentry
      await Sentry.withScope(async (scope) => {
        // Set user context
        scope.setUser({
          id: user?.id,
          email: user?.primaryEmailAddress?.emailAddress,
        });

        // Set feature request context
        scope.setTag("type", "feature-request");
        scope.setLevel("info");

        // Add detailed context
        scope.setContext("feature-request", {
          title: title.trim(),
          description: description.trim(),
          timestamp: new Date().toISOString(),
          appVersion,
          platform: "mobile",
        });

        // Add app context
        scope.setContext("app", {
          version: appVersion,
          environment: __DEV__ ? "development" : "production",
          platform: "react-native",
        });

        // Send as feedback to Sentry
        const feedback = await Sentry.captureFeedback({
          message: `Feature Request: ${title.trim()}\n\nDescription: ${description.trim()}`,
          name: user?.fullName || "Anonymous",
          email:
            user?.primaryEmailAddress?.emailAddress || "unknown@cadence.day",
        });

        console.log("Feature request submitted:", feedback);
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Feature Request Submitted",
        "Thank you! Your feature request has been sent to our development team.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error("Failed to submit feature request:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Submission Failed",
        "Failed to submit your feature request. Please try again or contact support."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={profileStyles.container}>
      <Stack.Screen
        options={{
          title: "Feature Request",
          headerShown: true,
          headerStyle: {
            backgroundColor: COLORS.light.background,
          },
          headerShadowVisible: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push("/settings/customer-support")}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.headerBorder} />

      <View style={styles.container}>
        <ScrollView style={styles.scrollableContent}>
          <View style={profileStyles.settingsSection}>
            <Text style={profileStyles.sectionTitle}>Feature Title</Text>
            <View
              style={[
                styles.primaryBorder,
                titleFocused && styles.primaryBorderActive,
              ]}
            >
              <View style={styles.noteContainerStyle}>
                <TextInput
                  style={styles.noteInputStyle}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Brief title for your feature request"
                  placeholderTextColor="#aaa"
                  maxLength={100}
                  multiline
                  scrollEnabled={false}
                  textAlignVertical="top"
                  onFocus={() => setTitleFocused(true)}
                  onBlur={() => setTitleFocused(false)}
                />
              </View>
            </View>
          </View>

          <View style={profileStyles.settingsSection}>
            <Text style={profileStyles.sectionTitle}>Description</Text>
            <View
              style={[
                styles.primaryBorder,
                descriptionFocused && styles.primaryBorderActive,
              ]}
            >
              <View style={styles.noteContainerStyle}>
                <TextInput
                  style={[
                    styles.noteInputStyle,
                    { minHeight: 120, paddingRight: 16 },
                  ]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Detailed description of the feature you'd like to see"
                  placeholderTextColor="#aaa"
                  multiline
                  scrollEnabled={false}
                  textAlignVertical="top"
                  onFocus={() => setDescriptionFocused(true)}
                  onBlur={() => setDescriptionFocused(false)}
                />
              </View>
            </View>
          </View>

          <View style={profileStyles.settingsSection}>
            <Text style={profileStyles.sectionTitle}>
              Information We Collect
            </Text>
            <View style={styles.infoContainer}>
              <Text style={styles.infoTextStyle}>
                • Your email address (for follow-up){"\n"}• App version and
                platform{"\n"}• Feature request details{"\n"}• Timestamp of
                submission
              </Text>
            </View>
          </View>

          <CdButton
            title={isSubmitting ? "Submitting..." : "Submit Feature Request"}
            onPress={handleSubmit}
            disabled={!title.trim() || !description.trim() || isSubmitting}
            variant="outline"
            style={{
              borderColor: COLORS.primary,
              marginHorizontal: 24,
            }}
            textStyle={{ color: COLORS.primary }}
          />
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  scrollableContent: {
    flex: 1,
    paddingTop: 16,
  },
  headerBorder: {
    height: 1,
    backgroundColor: COLORS.white,
  },
  fixedInfoSection: {
    backgroundColor: COLORS.light.background,
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.white,
  },
  noteContainerStyle: {
    minHeight: 60,
    position: "relative" as const,
  },
  primaryBorder: {
    borderRadius: 10,
    padding: 1.5,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#000000",
  },
  primaryBorderActive: {
    borderRadius: 10,
    padding: 1.5,
    marginBottom: 8,
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  noteInputStyle: {
    color: "#000000",
    fontSize: 16,
    padding: 16,
    minHeight: 60,
    textAlignVertical: "top" as const,
  },
  infoTextStyle: {
    fontSize: 14,
    color: "#000000",
    lineHeight: 20,
  },
  submitButtonStyle: {
    marginTop: 32,
    marginHorizontal: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: "#6366F1",
    borderRadius: 8,
    alignItems: "center" as const,
  },
  submitButtonDisabledStyle: {
    backgroundColor: "#AAAAAA",
  },
  submitButtonTextStyle: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  backText: {
    color: COLORS.primary,
    fontSize: 16,
    marginLeft: 4,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  infoIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.bodyText,
    lineHeight: 18,
  },
});

export default FeatureRequestScreen;
