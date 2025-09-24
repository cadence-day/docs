import { useProfileStore } from "@/features/profile/stores/useProfileStore";
import { profileStyles } from "@/features/profile/styles";
import {
  formatTimeInput,
  getTimeValidationError,
} from "@/features/profile/utils";
import { CdTextInputOneLine } from "@/shared/components/CadenceUI/CdTextInputOneLine";
import { COLORS } from "@/shared/constants/COLORS";
import useTranslation from "@/shared/hooks/useI18n";
import { useNotifications } from "@/shared/notifications";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useToast } from "../../shared/hooks";

export default function NotificationsSettings() {
  const { t } = useTranslation();
  const router = useRouter();
  const { showError, showSuccess, showInfo } = useToast();
  const { settings, updateSettings } = useProfileStore();
  const {
    preferences,
    updatePreferences,
    permissionStatus,
    requestPermissions,
  } = useNotifications();

  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(
    permissionStatus.granted
  );

  // Update push notifications state when permission status changes
  useEffect(() => {
    setPushNotificationsEnabled(permissionStatus.granted);
  }, [permissionStatus.granted]);

  const handleNotificationToggle = (
    type: "morningReminders" | "eveningReminders" | "weeklyStreaks",
    value: boolean
  ) => {
    const updatedNotifications = {
      ...settings.notifications,
      [type]: value,
    };

    updateSettings({
      notifications: updatedNotifications,
    });

    // Check if all notification types are disabled
    const allDisabled =
      !updatedNotifications.morningReminders &&
      !updatedNotifications.eveningReminders &&
      !updatedNotifications.weeklyStreaks;

    // If all notifications are disabled, disable push notifications too
    if (allDisabled && pushNotificationsEnabled) {
      setPushNotificationsEnabled(false);
      // Inform the user via toast instead of blocking alert
      showInfo?.(
        t("push-notifications-disabled") +
          "\n" +
          t("since-all-notification-types-a")
      );
    }

    // Only update notification rhythm for morning and evening reminders, not weekly streaks
    if (type === "morningReminders" || type === "eveningReminders") {
      let newRhythm = preferences.rhythm;

      if (type === "morningReminders") {
        if (value && !updatedNotifications.eveningReminders) {
          newRhythm = "morning-only";
        } else if (value && updatedNotifications.eveningReminders) {
          newRhythm = "both";
        } else if (!value && updatedNotifications.eveningReminders) {
          newRhythm = "evening-only";
        } else {
          newRhythm = "disabled";
        }
      } else if (type === "eveningReminders") {
        if (value && !updatedNotifications.morningReminders) {
          newRhythm = "evening-only";
        } else if (value && updatedNotifications.morningReminders) {
          newRhythm = "both";
        } else if (!value && updatedNotifications.morningReminders) {
          newRhythm = "morning-only";
        } else {
          newRhythm = "disabled";
        }
      }

      updatePreferences({
        rhythm: newRhythm,
        streaksEnabled: preferences.streaksEnabled,
      });
    } else if (type === "weeklyStreaks") {
      // Only update streaks setting, don't change rhythm
      updatePreferences({
        rhythm: preferences.rhythm,
        streaksEnabled: value,
      });
    }
  };

  const handlePushNotificationsToggle = async () => {
    if (!pushNotificationsEnabled) {
      try {
        const status = await requestPermissions();
        if (status.granted) {
          setPushNotificationsEnabled(true);

          // Automatically enable all notification types when push notifications are enabled
          updateSettings({
            notifications: {
              ...settings.notifications,
              morningReminders: true,
              eveningReminders: true,
              weeklyStreaks: true,
            },
          });

          // Update preferences to enable both morning and evening rhythm
          updatePreferences({
            rhythm: "both",
            streaksEnabled: true,
          });

          showSuccess?.(t("push-notifications-have-been-e"));
        } else {
          showInfo?.(
            t("permission-required") + "\n" + t("push-notification-permissions")
          );
        }
      } catch (error) {
        showError(error instanceof Error ? error.message : String(error)); // Show error toast
      }
    } else {
      setPushNotificationsEnabled(false);
      showInfo?.(t("push-notifications-have-been-d"));
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t("profile.notifications"),
          headerShown: true,
          headerStyle: {
            backgroundColor: COLORS.light.background,
          },
          headerShadowVisible: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push("/(home)/profile")}
              style={styles.backButton}
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
          {/* Push Notifications Section */}
          <View style={profileStyles.settingsSection}>
            <Text style={profileStyles.sectionTitle}>
              {t("settings.notifications.push")}
            </Text>

            <CdTextInputOneLine
              label={t("settings.notifications.push")}
              value={pushNotificationsEnabled ? t("enabled") : t("disabled")}
              showValueText={true}
              isButton={true}
              onPress={handlePushNotificationsToggle}
              showChevron={true}
            />
          </View>

          {/* Only show these sections if push notifications are enabled */}
          {pushNotificationsEnabled && (
            <>
              {/* App Notifications Section */}
              <View style={profileStyles.settingsSection}>
                <Text style={profileStyles.sectionTitle}>
                  {t("notification-types")}
                </Text>

                <CdTextInputOneLine
                  label={t("morning-reminders")}
                  value={
                    settings.notifications.morningReminders
                      ? t("enabled")
                      : t("disabled")
                  }
                  showValueText={true}
                  isButton={true}
                  onPress={() =>
                    handleNotificationToggle(
                      "morningReminders",
                      !settings.notifications.morningReminders
                    )
                  }
                  showChevron={true}
                />

                <CdTextInputOneLine
                  label={t("evening-reminders")}
                  value={
                    settings.notifications.eveningReminders
                      ? t("enabled")
                      : t("disabled")
                  }
                  showValueText={true}
                  isButton={true}
                  onPress={() =>
                    handleNotificationToggle(
                      "eveningReminders",
                      !settings.notifications.eveningReminders
                    )
                  }
                  showChevron={true}
                />

                <CdTextInputOneLine
                  label={t("weekly-streak-updates")}
                  value={
                    settings.notifications.weeklyStreaks
                      ? t("enabled")
                      : t("disabled")
                  }
                  showValueText={true}
                  isButton={true}
                  onPress={() =>
                    handleNotificationToggle(
                      "weeklyStreaks",
                      !settings.notifications.weeklyStreaks
                    )
                  }
                  showChevron={true}
                />
              </View>

              {/* Timing Settings Section - Only show if relevant notification types are enabled */}
              {(settings.notifications.morningReminders ||
                settings.notifications.eveningReminders) && (
                <View style={profileStyles.settingsSection}>
                  <Text style={profileStyles.sectionTitle}>
                    {t("notification-schedule")}
                  </Text>

                  {/* Show Midday Reflection time only if morning reminders are enabled */}
                  {settings.notifications.morningReminders && (
                    <CdTextInputOneLine
                      label={t("midday-reflection")}
                      value={preferences.middayTime}
                      showValueText={true}
                      onSave={(newTime) => {
                        // Normalize and validate time using shared profile utils
                        const formatted = formatTimeInput(newTime);
                        if (formatted) {
                          updatePreferences({ middayTime: formatted });
                        } else {
                          // Use the profile validation helper to get a friendly message when possible
                          const msg =
                            getTimeValidationError(newTime, "wake", t) ||
                            t("invalid-time") +
                              "\n" +
                              t("please-enter-time-in-hh-mm-for");
                          showInfo?.(msg);
                        }
                      }}
                      placeholder="12:00"
                    />
                  )}

                  {/* Show Evening Reflection time only if evening reminders are enabled */}
                  {settings.notifications.eveningReminders && (
                    <CdTextInputOneLine
                      label={t("evening-reflection")}
                      value={
                        preferences.eveningTime || preferences.eveningTimeStart
                      }
                      showValueText={true}
                      onSave={(newTime) => {
                        // Normalize and validate time using shared profile utils
                        const formatted = formatTimeInput(newTime);
                        if (formatted) {
                          updatePreferences({
                            eveningTime: formatted,
                            eveningTimeStart: formatted, // For backward compatibility
                          });
                        } else {
                          const msg =
                            getTimeValidationError(newTime, "sleep", t) ||
                            t("invalid-time") +
                              "\n" +
                              t("please-enter-time-in-hh-mm-for-0");
                          showInfo?.(msg);
                        }
                      }}
                      placeholder="20:00"
                    />
                  )}
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Fixed Info Section at the bottom */}
        <View style={styles.fixedInfoSection}>
          <Text style={profileStyles.sectionTitle}>
            {t("about-notifications")}
          </Text>

          <View style={styles.infoContainer}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={COLORS.primary}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              {t("morning-reminders-are-sent-aft")}
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  scrollableContent: {
    flex: 1,
    paddingTop: 16,
  },
  fixedInfoSection: {
    backgroundColor: COLORS.light.background,
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.white,
  },
  headerBorder: {
    height: 1,
    backgroundColor: COLORS.white,
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
