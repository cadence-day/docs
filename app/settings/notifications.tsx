import { useProfileStore } from "@/features/profile/stores/useProfileStore";
import { CdTextInputOneLine } from "@/shared/components/CadenceUI/CdTextInputOneLine";
import { COLORS } from "@/shared/constants/COLORS";
import useTranslation from "@/shared/hooks/useI18n";
import { useNotifications } from "@/shared/notifications";
import { DateTimePicker, Host } from "@expo/ui/swift-ui";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
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
  const [pushNotificationsEnabled, setPushNotificationsEnabled] =
    useState(permissionStatus.granted);

  // Time picker state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState<"wake" | "sleep" | "midday" | "evening">(
    "wake"
  );
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Update push notifications state when permission status changes
  useEffect(() => {
    setPushNotificationsEnabled(permissionStatus.granted);
  }, [permissionStatus.granted]);

  // Helper function to convert time string to Date object
  const timeStringToDate = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  };

  // Helper function to convert Date object to time string
  const dateToTimeString = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Handle time picker press
  const handleTimePress = (type: "wake" | "sleep") => {
    const currentTime =
      type === "wake" ? settings.wakeTime : settings.sleepTime;
    setSelectedDate(timeStringToDate(currentTime));
    setTimePickerMode(type);
    setShowTimePicker(true);
  };

  // Handle date selection from Expo UI DateTimePicker
  const handleDateSelected = (date: Date) => {
    const timeString = dateToTimeString(date);

    if (timePickerMode === "wake") {
      updateSettings({ wakeTime: timeString });
    } else if (timePickerMode === "sleep") {
      updateSettings({ sleepTime: timeString });
    } else if (timePickerMode === "midday") {
      updatePreferences({ middayTime: timeString });
    } else if (timePickerMode === "evening") {
      updatePreferences({ eveningTimeStart: timeString });
    }

    setSelectedDate(date);
    setShowTimePicker(false);
  };

  const handleNotificationToggle = (
    type: "morningReminders" | "eveningReminders" | "weeklyStreaks",
    value: boolean
  ) => {
    updateSettings({
      notifications: {
        ...settings.notifications,
        [type]: value,
      },
    });

    // Update notification preferences based on the toggles
    let newRhythm = preferences.rhythm;

    if (type === "morningReminders") {
      if (value && !settings.notifications.eveningReminders) {
        newRhythm = "morning-only";
      } else if (value && settings.notifications.eveningReminders) {
        newRhythm = "both";
      } else if (!value && settings.notifications.eveningReminders) {
        newRhythm = "evening-only";
      } else {
        newRhythm = "disabled";
      }
    } else if (type === "eveningReminders") {
      if (value && !settings.notifications.morningReminders) {
        newRhythm = "evening-only";
      } else if (value && settings.notifications.morningReminders) {
        newRhythm = "both";
      } else if (!value && settings.notifications.morningReminders) {
        newRhythm = "morning-only";
      } else {
        newRhythm = "disabled";
      }
    }

    updatePreferences({
      rhythm: newRhythm,
      streaksEnabled: type === "weeklyStreaks" ? value : preferences.streaksEnabled,
    });
  };

  const handlePushNotificationsToggle = async () => {
    if (!pushNotificationsEnabled) {
      try {
        const status = await requestPermissions();
        if (status.granted) {
          setPushNotificationsEnabled(true);
          Alert.alert(
            "Push Notifications",
            "Push notifications enabled successfully!",
            [{ text: "OK" }]
          );
        } else {
          Alert.alert(
            "Permission Denied",
            "Push notification permissions were not granted. You can enable them later in your device settings.",
            [{ text: "OK" }]
          );
        }
      } catch (error) {
        Alert.alert(
          "Error",
          "Failed to request push notification permissions. Please try again.",
          [{ text: "OK" }]
        );
      }
    } else {
      setPushNotificationsEnabled(false);
      Alert.alert(
        "Push Notifications",
        "Push notifications disabled. You can re-enable them anytime.",
        [{ text: "OK" }]
      );
    }
  };

  const openSystemSettings = () => {
    Alert.alert(
      "System Settings",
      "To fully manage notification permissions, you can open your device's system settings.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Settings",
          onPress: () => {
            // On iOS, this would open the app's notification settings
            // On Android, you might use Linking.openSettings()
            Alert.alert(
              "Feature Coming Soon",
              "System settings integration will be available soon."
            );
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t("profile.notifications"),
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container}>
        {/* Loading State */}
        {isLoading && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Loading notification settings...</Text>
          </View>
        )}

        {/* Push Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Push Notifications</Text>
          <Text style={styles.sectionDescription}>
            Control whether you receive push notifications from the app
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable Push Notifications</Text>
              <Text style={styles.settingSubtext}>
                Allow the app to send you notifications
              </Text>
            </View>
            <Switch
              value={pushNotificationsEnabled}
              onValueChange={handlePushNotificationsToggle}
              thumbColor={pushNotificationsEnabled ? COLORS.primary : "#f4f3f4"}
              trackColor={{ false: "#767577", true: COLORS.primary + "40" }}
            />
          </View>

          <CdTextInputOneLine
            label="System Settings"
            value="Manage in device settings"
            isButton
            onPress={openSystemSettings}
            buttonIcon="settings-outline"
          />
        </View>

        {/* App Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Notifications</Text>
          <Text style={styles.sectionDescription}>
            Choose which types of notifications you want to receive
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Morning Reminders</Text>
              <Text style={styles.settingSubtext}>
                Daily reminders to start your morning routine
              </Text>
            </View>
            <Switch
              value={settings.notifications.morningReminders}
              onValueChange={(value) =>
                handleNotificationToggle("morningReminders", value)
              }
              thumbColor={
                settings.notifications.morningReminders
                  ? COLORS.primary
                  : "#f4f3f4"
              }
              trackColor={{ false: "#767577", true: COLORS.primary + "40" }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Evening Reminders</Text>
              <Text style={styles.settingSubtext}>
                Reminders for your evening wind-down routine
              </Text>
            </View>
            <Switch
              value={settings.notifications.eveningReminders}
              onValueChange={(value) =>
                handleNotificationToggle("eveningReminders", value)
              }
              thumbColor={
                settings.notifications.eveningReminders
                  ? COLORS.primary
                  : "#f4f3f4"
              }
              trackColor={{ false: "#767577", true: COLORS.primary + "40" }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Weekly Streak Updates</Text>
              <Text style={styles.settingSubtext}>
                Celebrate your weekly achievements and streaks
              </Text>
            </View>
            <Switch
              value={settings.notifications.weeklyStreaks}
              onValueChange={(value) =>
                handleNotificationToggle("weeklyStreaks", value)
              }
              thumbColor={
                settings.notifications.weeklyStreaks
                  ? COLORS.primary
                  : "#f4f3f4"
              }
              trackColor={{ false: "#767577", true: COLORS.primary + "40" }}
            />
          </View>
        </View>

        {/* Timing Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Timing</Text>
          <Text style={styles.sectionDescription}>
            Notifications will be sent based on your wake and sleep times
          </Text>

          <CdTextInputOneLine
            label="Wake Time"
            value={settings.wakeTime}
            isButton
            onPress={() => handleTimePress("wake")}
            buttonIcon="time-outline"
          />

          <CdTextInputOneLine
            label="Sleep Time"
            value={settings.sleepTime}
            isButton
            onPress={() => handleTimePress("sleep")}
            buttonIcon="moon-outline"
          />

          <CdTextInputOneLine
            label="Midday Reflection Time"
            value={preferences.middayTime}
            isButton
            onPress={() => {
              // Handle midday time picker
              const [hours, minutes] = preferences.middayTime.split(":").map(Number);
              const date = new Date();
              date.setHours(hours, minutes, 0, 0);
              setSelectedDate(date);
              setTimePickerMode("midday");
              setShowTimePicker(true);
            }}
            buttonIcon="sunny-outline"
          />

          <CdTextInputOneLine
            label="Evening Reflection Start"
            value={preferences.eveningTimeStart}
            isButton
            onPress={() => {
              // Handle evening start time picker
              const [hours, minutes] = preferences.eveningTimeStart.split(":").map(Number);
              const date = new Date();
              date.setHours(hours, minutes, 0, 0);
              setSelectedDate(date);
              setTimePickerMode("evening");
              setShowTimePicker(true);
            }}
            buttonIcon="moon-outline"
          />

          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.infoText}>
              Morning reminders will be sent after your wake time, and evening
              reminders before your sleep time.
            </Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />

        {/* Expo UI Time Picker */}
        {showTimePicker && (
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(false)}
                  style={styles.pickerButton}
                >
                  <Text style={styles.pickerCancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.pickerTitle}>
                  Set {timePickerMode === "wake" ? "Wake"
                       : timePickerMode === "sleep" ? "Sleep"
                       : timePickerMode === "midday" ? "Midday Reflection"
                       : "Evening Reflection"} Time
                </Text>
                <View style={styles.pickerButton} />
              </View>
              <Host matchContents>
                <DateTimePicker
                  onDateSelected={handleDateSelected}
                  displayedComponents="hourAndMinute"
                  initialDate={selectedDate.toISOString()}
                  variant="wheel"
                />
              </Host>
            </View>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
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
  section: {
    backgroundColor: COLORS.white,
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.light.text,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.textIcons,
    marginBottom: 20,
    lineHeight: 20,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: COLORS.light.text,
    fontWeight: "500",
    marginBottom: 2,
  },
  settingSubtext: {
    fontSize: 13,
    color: COLORS.textIcons,
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#F8F9FF",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textIcons,
    marginLeft: 12,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
  // Expo UI Time Picker Styles
  pickerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  pickerContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34, // Account for safe area
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  pickerButton: {
    minWidth: 60,
  },
  pickerCancelText: {
    fontSize: 16,
    color: COLORS.textIcons,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.light.text,
  },
});
