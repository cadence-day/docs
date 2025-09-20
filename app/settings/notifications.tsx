import { useProfileStore } from "@/features/profile/stores/useProfileStore";
import { profileStyles } from "@/features/profile/styles";
import { CdTextInputOneLine } from "@/shared/components/CadenceUI/CdTextInputOneLine";
import { COLORS } from "@/shared/constants/COLORS";
import useTranslation from "@/shared/hooks/useI18n";
import { useNotifications } from "@/shared/notifications";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function NotificationsSettings() {
  const { t } = useTranslation();
  const router = useRouter();
  const { settings, updateSettings } = useProfileStore();
  const {
    preferences,
    updatePreferences,
    permissionStatus,
    requestPermissions,
    isInitialized,
    isLoading,
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
      Alert.alert(
        "Push Notifications Disabled",
        "Since all notification types are disabled, push notifications have been turned off automatically."
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

          Alert.alert(
            "Success",
            "Push notifications have been enabled successfully! All notification types have been turned on."
          );
        } else {
          Alert.alert(
            "Permission Required",
            "Push notification permissions are required to receive notifications. You can enable them in your device settings."
          );
        }
      } catch (error) {
        Alert.alert(
          "Error",
          "Failed to enable push notifications. Please try again."
        );
      }
    } else {
      setPushNotificationsEnabled(false);
      Alert.alert(
        "Disabled",
        "Push notifications have been disabled. You can re-enable them anytime."
      );
    }
  };

  const openSystemSettings = () => {
    Alert.alert(
      "System Settings",
      "To modify notification permissions at the system level, please go to your device's Settings app and find this app's notification settings.",
      [{ text: "OK", style: "default" }]
    );
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
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.headerBorder} />

      <View style={styles.container}>
        <ScrollView style={styles.scrollableContent}>
          {/* Push Notifications Section */}
          <View style={profileStyles.settingsSection}>
            <Text style={profileStyles.sectionTitle}>Push Notifications</Text>

            <CdTextInputOneLine
              label="Push Notifications"
              value={pushNotificationsEnabled ? "Enabled" : "Disabled"}
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
                  Notification Types
                </Text>

                <CdTextInputOneLine
                  label="Morning Reminders"
                  value={
                    settings.notifications.morningReminders
                      ? "Enabled"
                      : "Disabled"
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
                  label="Evening Reminders"
                  value={
                    settings.notifications.eveningReminders
                      ? "Enabled"
                      : "Disabled"
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
                  label="Weekly Streak Updates"
                  value={
                    settings.notifications.weeklyStreaks
                      ? "Enabled"
                      : "Disabled"
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
                    Notification Schedule
                  </Text>

                  {/* Show Midday Reflection time only if morning reminders are enabled */}
                  {settings.notifications.morningReminders && (
                    <CdTextInputOneLine
                      label="Midday Reflection"
                      value={preferences.middayTime}
                      showValueText={true}
                      onSave={(newTime) => {
                        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
                        if (timeRegex.test(newTime)) {
                          updatePreferences({ middayTime: newTime });
                        } else {
                          Alert.alert(
                            "Invalid Time",
                            "Please enter time in HH:MM format (e.g., 12:00)"
                          );
                        }
                      }}
                      placeholder="12:00"
                    />
                  )}

                  {/* Show Evening Reflection time only if evening reminders are enabled */}
                  {settings.notifications.eveningReminders && (
                    <CdTextInputOneLine
                      label="Evening Reflection"
                      value={preferences.eveningTimeStart}
                      showValueText={true}
                      onSave={(newTime) => {
                        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
                        if (timeRegex.test(newTime)) {
                          updatePreferences({ eveningTimeStart: newTime });
                        } else {
                          Alert.alert(
                            "Invalid Time",
                            "Please enter time in HH:MM format (e.g., 20:00)"
                          );
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
          <Text style={profileStyles.sectionTitle}>About Notifications</Text>

          <View style={styles.infoContainer}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={COLORS.primary}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              Morning reminders are sent after your wake time, and evening
              reminders before your sleep time. Weekly streak updates celebrate
              your achievements every Sunday.
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
