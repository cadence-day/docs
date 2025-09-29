import { profileStyles } from "@/features/profile/styles";
import {
  formatTimeInput,
  getTimeValidationError,
} from "@/features/profile/utils";
import { CdTextInputOneLine } from "@/shared/components/CadenceUI/CdTextInputOneLine";
import { COLORS } from "@/shared/constants/COLORS";
import useTranslation from "@/shared/hooks/useI18n";
import { notificationEngine } from "@/shared/notifications/NotificationEngine";
import useNotificationSettingsStore from "@/shared/stores/resources/useNotificationsStore";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { HIT_SLOP_10 } from "../../shared/constants/hitSlop";
import { useToast } from "../../shared/hooks";

export default function NotificationsSettings() {
  const { t } = useTranslation();
  const router = useRouter();
  const { showError, showSuccess, showInfo } = useToast();

  // Use the new notification store
  const {
    notificationSettings,
    updateNotificationSettings,
    initializeForCurrentUser,
  } = useNotificationSettingsStore();

  const [pushNotificationsEnabled, setPushNotificationsEnabled] =
    useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>("");

  // Initialize and check permissions
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeForCurrentUser();
        const permissions = await Notifications.getPermissionsAsync();
        const status = permissions.status;
        setPermissionStatus(status);
        setPushNotificationsEnabled(status === "granted");
      } catch (error) {
        console.error("Failed to initialize notifications:", error);
      }
    };
    initialize();
  }, [initializeForCurrentUser]);

  // Get preferences and timing from the settings
  const preferences = notificationSettings
    ? {
        morningReminders:
          notificationSettings.notification_type?.includes(
            "morning-reminders"
          ) ?? false,
        eveningReminders:
          notificationSettings.notification_type?.includes(
            "evening-reminders"
          ) ?? false,
        middayReflection:
          notificationSettings.notification_type?.includes("midday-checkins") ??
          false,
        weeklyStreaks: false, // Not supported in current database schema
      }
    : {
        morningReminders: false,
        eveningReminders: false,
        middayReflection: false,
        weeklyStreaks: false,
      };

  const timing = {
    morningTime: notificationSettings?.wake_up_time ?? "07:00",
    middayTime: "12:00", // Default midday time
    eveningTime: notificationSettings?.sleep_time ?? "19:00",
  };

  // Helper functions
  const requestPermissions = async (): Promise<boolean> => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionStatus(status);
    return status === "granted";
  };

  const updatePreferences = async (updates: Partial<typeof preferences>) => {
    if (!notificationSettings) return;

    const currentTypes = notificationSettings.notification_type ?? [];
    let newTypes: (
      | "morning-reminders"
      | "evening-reminders"
      | "midday-checkins"
    )[] = [...currentTypes];

    // Update notification types based on preferences
    Object.entries(updates).forEach(([key, enabled]) => {
      let typeToToggle:
        | "morning-reminders"
        | "evening-reminders"
        | "midday-checkins"
        | null = null;
      switch (key) {
        case "morningReminders":
          typeToToggle = "morning-reminders";
          break;
        case "eveningReminders":
          typeToToggle = "evening-reminders";
          break;
        case "middayReflection":
          typeToToggle = "midday-checkins";
          break;
        case "weeklyStreaks":
          return; // Skip weekly streaks as not supported
      }

      if (!typeToToggle) return;

      if (enabled && !newTypes.includes(typeToToggle)) {
        newTypes.push(typeToToggle);
      } else if (!enabled) {
        newTypes = newTypes.filter((type) => type !== typeToToggle);
      }
    });

    await updateNotificationSettings({
      ...notificationSettings,
      notification_type: newTypes,
    });
  };

  const updateTiming = async (timeUpdates: {
    morningTime?: string;
    middayTime?: string;
    eveningTime?: string;
  }) => {
    if (!notificationSettings) return;

    const updates = { ...notificationSettings };
    if (timeUpdates.morningTime) {
      updates.wake_up_time = timeUpdates.morningTime;
    }
    if (timeUpdates.eveningTime) {
      updates.sleep_time = timeUpdates.eveningTime;
    }

    await updateNotificationSettings(updates);
    await notificationEngine.scheduleAllNotifications();
  };

  const handleNotificationToggle = async (
    type:
      | "morningReminders"
      | "eveningReminders"
      | "weeklyStreaks"
      | "middayReflection",
    value: boolean
  ) => {
    try {
      // Update the preferences in the new store
      await updatePreferences({
        [type]: value,
      });

      // Re-schedule notifications after preference changes
      await notificationEngine.scheduleAllNotifications();

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

      showSuccess?.(t("notification-preferences-updated"));
    } catch (error) {
      showError?.(error instanceof Error ? error.message : String(error));
    }
  };

  const handlePushNotificationsToggle = async () => {
    if (!pushNotificationsEnabled) {
      try {
        const granted = await requestPermissions();
        if (granted) {
          setPushNotificationsEnabled(true);

          // Update push_enabled in database
          if (notificationSettings) {
            await updateNotificationSettings({
              ...notificationSettings,
              push_enabled: true,
            });
          }

          // Automatically enable key notification types when push notifications are enabled
          await updatePreferences({
            morningReminders: true,
            eveningReminders: true,
            middayReflection: true,
            // weeklyStreaks: true, // Not supported in current schema
          });

          // Initialize the notification engine and schedule notifications
          await notificationEngine.initialize();
          await notificationEngine.scheduleAllNotifications();

          showSuccess?.(t("push-notifications-have-been-e"));
        } else {
          showInfo?.(
            t("permission-required") + "\n" + t("push-notification-permissions")
          );
        }
      } catch (error) {
        showError?.(error instanceof Error ? error.message : String(error));
      }
    } else {
      setPushNotificationsEnabled(false);

      // Update push_enabled in database
      if (notificationSettings) {
        await updateNotificationSettings({
          ...notificationSettings,
          push_enabled: false,
        });
      }

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
