import { profileStyles } from "@/features/profile/styles";
import {
  formatTimeInput,
  getTimeValidationError,
} from "@/features/profile/utils";
import { CdTextInputOneLine } from "@/shared/components/CadenceUI/CdTextInputOneLine";
import { COLORS } from "@/shared/constants/COLORS";
import useTranslation from "@/shared/hooks/useI18n";
import { notificationEngine } from "@/shared/notifications/NotificationEngine";
import { useNotificationStore } from "@/shared/notifications/stores/notificationsStore";
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
  const {
    preferences,
    timing,
    updatePreferences,
    updateTiming,
    permissionStatus,
    requestPermissions,
    scheduleNotifications,
  } = useNotificationStore();

  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(
    permissionStatus === "granted"
  );

  // Update push notifications state when permission status changes
  useEffect(() => {
    setPushNotificationsEnabled(permissionStatus === "granted");
  }, [permissionStatus]);

  const handleNotificationToggle = async (
    type:
      | "morningReminders"
      | "eveningReminders"
      | "weeklyStreaks"
      | "middayReflection",
    value: boolean
  ) => {
    // Update the preferences in the new store
    await updatePreferences({
      [type]: value,
    });

    // Check if all notification types are disabled
    const updatedPreferences = {
      ...preferences,
      [type]: value,
    };

    const allDisabled =
      !updatedPreferences.morningReminders &&
      !updatedPreferences.eveningReminders &&
      !updatedPreferences.middayReflection &&
      !updatedPreferences.weeklyStreaks;

    // If all notifications are disabled, disable push notifications too
    if (allDisabled && pushNotificationsEnabled) {
      setPushNotificationsEnabled(false);
      showInfo?.(
        t("push-notifications-disabled") +
          "\n" +
          t("since-all-notification-types-a")
      );
    }
  };

  const handlePushNotificationsToggle = async () => {
    if (!pushNotificationsEnabled) {
      try {
        const granted = await requestPermissions();
        if (granted) {
          setPushNotificationsEnabled(true);

          // Automatically enable all notification types when push notifications are enabled
          updatePreferences({
            morningReminders: true,
            eveningReminders: true,
            middayReflection: true,
            weeklyStreaks: true,
          });

          // Initialize the notification engine and schedule notifications
          await notificationEngine.initialize();
          await scheduleNotifications();

          showSuccess?.(t("push-notifications-have-been-e"));
        } else {
          showInfo?.(
            t("permission-required") + "\n" + t("push-notification-permissions")
          );
        }
      } catch (error) {
        showError(error instanceof Error ? error.message : String(error));
      }
    } else {
      setPushNotificationsEnabled(false);

      // Cancel all scheduled notifications
      await notificationEngine.cancelAllNotifications();

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
                    preferences.morningReminders ? t("enabled") : t("disabled")
                  }
                  showValueText={true}
                  isButton={true}
                  onPress={() =>
                    handleNotificationToggle(
                      "morningReminders",
                      !preferences.morningReminders
                    )
                  }
                  showChevron={true}
                />

                <CdTextInputOneLine
                  label={t("midday-reflection")}
                  value={
                    preferences.middayReflection ? t("enabled") : t("disabled")
                  }
                  showValueText={true}
                  isButton={true}
                  onPress={() =>
                    handleNotificationToggle(
                      "middayReflection",
                      !preferences.middayReflection
                    )
                  }
                  showChevron={true}
                />

                <CdTextInputOneLine
                  label={t("evening-reminders")}
                  value={
                    preferences.eveningReminders ? t("enabled") : t("disabled")
                  }
                  showValueText={true}
                  isButton={true}
                  onPress={() =>
                    handleNotificationToggle(
                      "eveningReminders",
                      !preferences.eveningReminders
                    )
                  }
                  showChevron={true}
                />

                <CdTextInputOneLine
                  label={t("weekly-streak-updates")}
                  value={
                    preferences.weeklyStreaks ? t("enabled") : t("disabled")
                  }
                  showValueText={true}
                  isButton={true}
                  onPress={() =>
                    handleNotificationToggle(
                      "weeklyStreaks",
                      !preferences.weeklyStreaks
                    )
                  }
                  showChevron={true}
                />
              </View>

              {/* Timing Settings Section - Show if any time-based notifications are enabled */}
              {(preferences.morningReminders ||
                preferences.middayReflection ||
                preferences.eveningReminders) && (
                <View style={profileStyles.settingsSection}>
                  <Text style={profileStyles.sectionTitle}>
                    {t("notification-schedule")}
                  </Text>

                  {/* Show Morning time if morning reminders are enabled */}
                  {preferences.morningReminders && (
                    <CdTextInputOneLine
                      label={t("morning-time")}
                      value={timing.morningTime}
                      showValueText={true}
                      onSave={async (newTime) => {
                        const formatted = formatTimeInput(newTime);
                        if (formatted) {
                          await updateTiming({ morningTime: formatted });
                        } else {
                          const msg =
                            getTimeValidationError(newTime, "wake", t) ||
                            t("invalid-time") +
                              "\n" +
                              t("please-enter-time-in-hh-mm-for");
                          showInfo?.(msg);
                        }
                      }}
                      placeholder="07:00"
                    />
                  )}

                  {/* Show Midday time if midday reflection is enabled */}
                  {preferences.middayReflection && (
                    <CdTextInputOneLine
                      label={t("midday-reflection")}
                      value={timing.middayTime}
                      showValueText={true}
                      onSave={async (newTime) => {
                        const formatted = formatTimeInput(newTime);
                        if (formatted) {
                          await updateTiming({ middayTime: formatted });
                        } else {
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

                  {/* Show Evening time if evening reminders are enabled */}
                  {preferences.eveningReminders && (
                    <CdTextInputOneLine
                      label={t("evening-reflection")}
                      value={timing.eveningTime}
                      showValueText={true}
                      onSave={async (newTime) => {
                        const formatted = formatTimeInput(newTime);
                        if (formatted) {
                          await updateTiming({ eveningTime: formatted });
                        } else {
                          const msg =
                            getTimeValidationError(newTime, "sleep", t) ||
                            t("invalid-time") +
                              "\n" +
                              t("please-enter-time-in-hh-mm-for-0");
                          showInfo?.(msg);
                        }
                      }}
                      placeholder="19:00"
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
