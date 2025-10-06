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
import { useTheme } from "@/shared/hooks";
import useTranslation from "@/shared/hooks/useI18n";
import { CdButton } from "../../shared/components";
import { HIT_SLOP_10 } from "../../shared/constants/hitSlop";
import { GlobalErrorHandler } from "../../shared/utils/errorHandler";

const FeatureRequestScreen = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);
  const { t } = useTranslation();
  const { user } = useUser();
  const theme = useTheme();
  const appVersion =
    Constants.expoConfig?.version || t("settings.support.version-unknown");

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert(t("common.error"), t("please-fill-in-both-title-and"));
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
        GlobalErrorHandler.logDebug(
          "FEATURE_REQUEST_SUBMITTED",
          "settings.feature-request",
          { feedback }
        );
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        t("feature-request-submitted"),
        t("thank-you-your-feature-request"),
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        "Failed to submit feature request",
        "FEATURE_REQUEST_ERROR",
        { error, userId: user?.id ?? null }
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t("submission-failed"), t("failed-to-submit-your-feature"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={profileStyles.container}>
      <Stack.Screen
        options={{
          title: t("profile.support.feature"),
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.background.primary,
          },
          headerShadowVisible: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push("/settings/customer-support")}
              style={styles.backButton}
              hitSlop={HIT_SLOP_10}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
              <Text style={styles.backText}>{t("settings.back")}</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.headerBorder} />

      <View style={styles.container}>
        <ScrollView style={styles.scrollableContent}>
          <View style={profileStyles.settingsSection}>
            <Text style={profileStyles.sectionTitle}>{t("feature-title")}</Text>
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
                  placeholder={t("brief-title-for-your-feature-r")}
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
            <Text style={profileStyles.sectionTitle}>{t("description")}</Text>
            <View
              style={[
                styles.primaryBorder,
                descriptionFocused && styles.primaryBorderActive,
              ]}
            >
              <View style={styles.noteContainerStyle}>
                <TextInput
                  style={[styles.noteInputStyle, styles.descriptionInputStyle]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder={t("detailed-description-of-the-fe")}
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
              {t("information-we-collect")}
            </Text>
            <View style={styles.infoContainer}>
              <Text style={styles.infoTextStyle}>
                {t("your-email-address-for-follow")}
                {"\n"}
                {t("app-version-and-platform")}
                {"\n"}
                {t("feature-request-details")}
                {"\n"}
                {t("timestamp-of-submission")}
              </Text>
            </View>
          </View>

          <CdButton
            title={isSubmitting ? "Submitting..." : t("submit-feature-request")}
            onPress={handleSubmit}
            disabled={!title.trim() || !description.trim() || isSubmitting}
            variant="outline"
            style={styles.SubmitButtonStyle}
            textStyle={styles.submitButtonText}
          />
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background.primary,
  },
  scrollableContent: {
    flex: 1,
    paddingTop: 16,
  },
  headerBorder: {
    height: 1,
    backgroundColor: COLORS.white,
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
  descriptionInputStyle: {
    minHeight: 120,
    paddingRight: 16,
  },
  infoTextStyle: {
    fontSize: 14,
    color: "#000000",
    lineHeight: 20,
  },
  SubmitButtonStyle: {
    borderColor: COLORS.primary,
  },
  submitButtonText: {
    color: COLORS.primary,
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
});

export default FeatureRequestScreen;
