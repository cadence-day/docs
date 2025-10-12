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
import { CdButton } from "@/shared/components";
import { COLORS } from "@/shared/constants/COLORS";
import { useTheme } from "@/shared/hooks";
import useTranslation from "@/shared/hooks/useI18n";
import { Logger } from "@/shared/utils/errorHandler";
import { HIT_SLOP_10 } from "../../shared/constants/hitSlop";

export default function BugReportScreen() {
  const { t } = useTranslation();
  const { user } = useUser();
  const theme = useTheme();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleFocused, setTitleFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);
  const [stepsFocused, setStepsFocused] = useState(false);
  const [expectedFocused, setExpectedFocused] = useState(false);
  const [actualFocused, setActualFocused] = useState(false);
  const [stepsToReproduce, setStepsToReproduce] = useState("");
  const [expectedBehavior, setExpectedBehavior] = useState("");
  const [actualBehavior, setActualBehavior] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert(t("common.error"), t("please-enter-a-bug-title"));
      return;
    }

    if (!description.trim()) {
      Alert.alert(t("common.error"), t("please-enter-a-bug-description"));
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketId = `bug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const deviceInfo = {
        platform: "mobile",
        version:
          Constants.expoConfig?.version ||
          t("settings.support.version-unknown"),
        model: t("react-native-device"),
      };

      const sentryEventId = Sentry.withScope((scope) => {
        scope.setUser({
          id: user?.id,
          email:
            user?.primaryEmailAddress?.emailAddress ||
            user?.emailAddresses?.[0]?.emailAddress,
        });

        scope.setTag("bug_report", true);
        scope.setTag("ticket_id", ticketId);
        scope.setTag("app_version", Constants.expoConfig?.version);
        scope.setTag("platform", "mobile");

        scope.setContext("app_info", {
          version: Constants.expoConfig?.version,
          environment: __DEV__ ? "development" : "production",
        });

        scope.setContext("device_info", deviceInfo);

        scope.setContext("bug_report", {
          ticketId,
          title: title.trim(),
          description: description.trim(),
          stepsToReproduce: stepsToReproduce.trim(),
          expectedBehavior: expectedBehavior.trim(),
          actualBehavior: actualBehavior.trim(),
          timestamp: new Date().toISOString(),
          userEmail:
            user?.primaryEmailAddress?.emailAddress ||
            user?.emailAddresses?.[0]?.emailAddress,
          userId: user?.id,
        });

        const eventId = Sentry.captureMessage(
          `[BUG REPORT] ${title.trim()}: ${description.substring(0, 100)}${description.length > 100 ? "..." : ""}`,
          "warning"
        );

        return eventId;
      });

      if (sentryEventId) {
        Sentry.captureFeedback({
          name:
            user?.fullName ||
            user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
            "User",
          email:
            user?.primaryEmailAddress?.emailAddress ||
            user?.emailAddresses?.[0]?.emailAddress ||
            "no-email@example.com",
          message: `Bug Report: ${title.trim()}\n\nDESCRIPTION:\n${description.trim()}\n\nSTEPS TO REPRODUCE:\n${stepsToReproduce.trim() || "Not provided"}\n\nEXPECTED BEHAVIOR:\n${expectedBehavior.trim() || "Not provided"}\n\nACTUAL BEHAVIOR:\n${actualBehavior.trim() || "Not provided"}\n\nDEVICE INFO:\n- App Version: ${Constants.expoConfig?.version || "Unknown"}`,
        });
      }

      Logger.logError(new Error(`Bug report - ${ticketId}`), "BUG_REPORT", {
        ticketId,
        userId: user?.id,
        email:
          user?.primaryEmailAddress?.emailAddress ||
          user?.emailAddresses?.[0]?.emailAddress,
        title: title.trim(),
        description: description.trim(),
        stepsToReproduce: stepsToReproduce.trim(),
        expectedBehavior: expectedBehavior.trim(),
        actualBehavior: actualBehavior.trim(),
        deviceInfo,
        appVersion: Constants.expoConfig?.version,
        sentryEventId,
        timestamp: new Date().toISOString(),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        t("bug-report-submitted"),
        t("thank-you-your-bug-report-has"),
        [
          {
            text: "OK",
            onPress: () => {
              setTitle("");
              setDescription("");
              setStepsToReproduce("");
              setExpectedBehavior("");
              setActualBehavior("");
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      Logger.logError(error, "BUG_REPORT_FAILED", {
        userId: user?.id,
        title: title.trim(),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      Alert.alert(t("common.error"), t("unable-to-submit-bug-report-pl"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={profileStyles.container}>
      <Stack.Screen
        options={{
          title: t("profile.support.bug"),
          headerShown: true,
          headerStyle: { backgroundColor: theme.background.primary },
          headerShadowVisible: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push("/settings/customer-support")}
              style={styles.backButton}
              hitSlop={HIT_SLOP_10}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
              <Text style={styles.backText}>{t("back")}</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.headerBorder} />

      <View style={styles.container}>
        <ScrollView style={styles.scrollableContent}>
          <View style={profileStyles.settingsSection}>
            <Text style={profileStyles.sectionTitle}>{t("bug-title")}</Text>
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
                  placeholder={t("brief-title-describing-the-bug")}
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
                  placeholder={t("describe-what-happened-in-deta")}
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
              {t("steps-to-reproduce")}
            </Text>
            <View
              style={[
                styles.primaryBorder,
                stepsFocused && styles.primaryBorderActive,
              ]}
            >
              <View style={styles.noteContainerStyle}>
                <TextInput
                  style={[styles.noteInputStyle, styles.stepsInputStyle]}
                  value={stepsToReproduce}
                  onChangeText={setStepsToReproduce}
                  placeholder={t("steps-to-reproduce-optional")}
                  placeholderTextColor="#aaa"
                  multiline
                  scrollEnabled={false}
                  textAlignVertical="top"
                  onFocus={() => setStepsFocused(true)}
                  onBlur={() => setStepsFocused(false)}
                />
              </View>
            </View>
          </View>

          <View style={profileStyles.settingsSection}>
            <Text style={profileStyles.sectionTitle}>
              {t("expected-behavior")}
            </Text>
            <View
              style={[
                styles.primaryBorder,
                expectedFocused && styles.primaryBorderActive,
              ]}
            >
              <View style={styles.noteContainerStyle}>
                <TextInput
                  style={styles.noteInputStyle}
                  value={expectedBehavior}
                  onChangeText={setExpectedBehavior}
                  placeholder={t("expected-behavior-optional")}
                  placeholderTextColor="#aaa"
                  multiline
                  scrollEnabled={false}
                  textAlignVertical="top"
                  onFocus={() => setExpectedFocused(true)}
                  onBlur={() => setExpectedFocused(false)}
                />
              </View>
            </View>
          </View>

          <View style={profileStyles.settingsSection}>
            <Text style={profileStyles.sectionTitle}>
              {t("actual-behavior")}
            </Text>
            <View
              style={[
                styles.primaryBorder,
                actualFocused && styles.primaryBorderActive,
              ]}
            >
              <View style={styles.noteContainerStyle}>
                <TextInput
                  style={styles.noteInputStyle}
                  value={actualBehavior}
                  onChangeText={setActualBehavior}
                  placeholder={t("actual-behavior-optional")}
                  placeholderTextColor="#aaa"
                  multiline
                  scrollEnabled={false}
                  textAlignVertical="top"
                  onFocus={() => setActualFocused(true)}
                  onBlur={() => setActualFocused(false)}
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
                {t("bug-report-details-title-descr")}
                {"\n"}
                {t("steps-to-reproduce-optional-0")}
                {"\n"}
                {t("timestamp-of-submission")}
              </Text>
            </View>
          </View>

          <CdButton
            title={
              isSubmitting ? t("common.submitting") : t("submit-bug-report")
            }
            onPress={handleSubmit}
            disabled={!title.trim() || !description.trim() || isSubmitting}
            variant="outline"
            style={styles.SubmitButtonStyle}
            textStyle={styles.submitButtonText}
          />
        </ScrollView>
        {/* Fixed Info Section */}
        <View style={styles.fixedInfoSection}>
          <Text style={profileStyles.sectionTitle}>
            {t("support-information")}
          </Text>

          <View style={styles.infoContainer}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={COLORS.primary}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              {t("we-collect-your-email-for-foll")}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

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
  fixedInfoSection: {
    backgroundColor: COLORS.light.background.primary,
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
  descriptionInputStyle: {
    minHeight: 120,
    paddingRight: 16,
  },
  stepsInputStyle: {
    minHeight: 80,
  },
  infoTextStyle: {
    fontSize: 14,
    color: "#000000",
    lineHeight: 20,
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
  SubmitButtonStyle: {
    borderColor: COLORS.primary,
    marginBottom: 32,
  },
  submitButtonText: {
    color: COLORS.primary,
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
