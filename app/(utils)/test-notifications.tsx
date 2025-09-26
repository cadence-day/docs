import { COLORS } from "@/shared/constants/COLORS";
import { ToastService } from "@/shared/context/ToastProvider";
import { notificationEngine } from "@/shared/notifications/NotificationEngine";
import { BackgroundTaskManager } from "@/shared/notifications/services/BackgroundTaskManager";
import useNotificationStore from "@/shared/stores/resources/useNotificationsStore";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { useUser } from "@clerk/clerk-expo";
import * as Notifications from "expo-notifications";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import HIT_SLOP_10 from "../../shared/constants/hitSlop";

interface ScheduledNotificationData {
  identifier: string;
  content: {
    title: string;
    body: string;
    data?: Record<string, unknown>;
  };
  trigger: Record<string, unknown> | null;
}

interface BackgroundNotificationData {
  id: string;
  type: string;
  scheduledFor: Date;
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export default function TestNotifications() {
  const { user } = useUser();
  const { t } = useTranslation();
  const {
    requestPermissions,
    permissionStatus,
    scheduleNotifications,
    usedQuoteIds,
    nextQuoteIndex,
    preferences,
    timing,
    resetQuoteBacklog,
    repairTiming,
  } = useNotificationStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [delaySeconds, setDelaySeconds] = useState("5");
  const [selectedNotificationType, setSelectedNotificationType] =
    useState<NotificationType>("midday-reflection");
  const [scheduledNotifications, setScheduledNotifications] = useState<
    ScheduledNotificationData[]
  >([]);
  const [backgroundNotifications, setBackgroundNotifications] = useState<
    BackgroundNotificationData[]
  >([]);

  // Initialize the notification engine on mount
  React.useEffect(() => {
    const initialize = async () => {
      try {
        await notificationEngine.initialize();
        setIsInitialized(true);
        await loadScheduledNotifications();
        await loadBackgroundNotifications();
      } catch (error) {
        GlobalErrorHandler.logError(
          error as Error,
          "NotificationEngine.initialize"
        );
      }
    };
    initialize();
  }, []);

  // Refresh scheduled notifications every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      await loadScheduledNotifications();
      await loadBackgroundNotifications();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadScheduledNotifications = async () => {
    try {
      const scheduledNotifs =
        await Notifications.getAllScheduledNotificationsAsync();
      // Map NotificationRequest[] to ScheduledNotificationData[]
      const mappedNotifs: ScheduledNotificationData[] = scheduledNotifs.map(
        (notif) => ({
          identifier: notif.identifier,
          content: {
            title: notif.content.title ?? "",
            body: notif.content.body ?? "",
            data: notif.content.data,
          },
          trigger: notif.trigger
            ? (notif.trigger as Record<string, unknown>)
            : {},
        })
      );
      setScheduledNotifications(mappedNotifs);
    } catch (error) {
      GlobalErrorHandler.logError(error as Error, "loadScheduledNotifications");
    }
  };

  const loadBackgroundNotifications = async () => {
    try {
      const taskManager = BackgroundTaskManager.getInstance();
      const backgroundNotifs = await taskManager.listScheduledNotifications();
      setBackgroundNotifications(backgroundNotifs);
    } catch (error) {
      GlobalErrorHandler.logError(
        error as Error,
        "loadBackgroundNotifications"
      );
    }
  };

  const handleRequestPermissions = async () => {
    try {
      const granted = await requestPermissions();
      Alert.alert(
        "Permission Status",
        `Granted: ${granted ? "Yes" : "No"}\nStatus: ${permissionStatus}`
      );
    } catch (error) {
      GlobalErrorHandler.logError(error as Error, "handleRequestPermissions");
      Alert.alert("Error", "Failed to request permissions");
    }
  };

  const handleSendImmediate = async () => {
    try {
      setIsLoading(true);
      await notificationEngine.deliverNotificationNow(selectedNotificationType);
      Alert.alert("Success", "Immediate notification sent!");
    } catch (error) {
      GlobalErrorHandler.logError(error as Error, "handleSendImmediate");
      Alert.alert("Error", "Failed to send notification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleDelayed = async () => {
    try {
      setIsLoading(true);
      const delay = parseInt(delaySeconds) || 5;
      const scheduledFor = new Date();
      scheduledFor.setSeconds(scheduledFor.getSeconds() + delay);

      await notificationEngine.forceScheduleQuoteNotification(
        scheduledFor,
        selectedNotificationType
      );
      Alert.alert(
        "Success",
        `Delayed notification scheduled for ${delay} seconds from now!`
      );
      await loadScheduledNotifications();
    } catch (error) {
      GlobalErrorHandler.logError(error as Error, "handleScheduleDelayed");
      Alert.alert("Error", "Failed to schedule delayed notification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleMultipleWithDelay = async () => {
    try {
      setIsLoading(true);
      const delay = parseInt(delaySeconds) || 5;
      const types: NotificationType[] = [
        "midday-reflection",
        "evening-reflection",
        "weekly-streaks",
      ];

      for (let i = 0; i < types.length; i++) {
        const scheduledFor = new Date();
        scheduledFor.setSeconds(scheduledFor.getSeconds() + delay + i * 10); // 10 seconds apart

        await notificationEngine.forceScheduleQuoteNotification(
          scheduledFor,
          types[i]
        );
      }

      Alert.alert(
        "Success",
        `3 notifications scheduled with ${delay}s delay and 10s intervals!`
      );
      await loadScheduledNotifications();
    } catch (error) {
      GlobalErrorHandler.logError(
        error as Error,
        "handleScheduleMultipleWithDelay"
      );
      Alert.alert("Error", "Failed to schedule multiple delayed notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestBackgroundManager = async () => {
    try {
      setIsLoading(true);
      const taskManager = BackgroundTaskManager.getInstance();
      const delay = parseInt(delaySeconds) || 5;

      await taskManager.scheduleNotification({
        id: `bg-test-${Date.now()}`,
        type: "test-background",
        scheduledFor: new Date(Date.now() + delay * 1000),
        userId: user?.id || "test",
        title: `🔔 Background Test (${delay}s delay)`,
        body: `This notification was scheduled through BackgroundTaskManager with a ${delay} second delay`,
        data: { source: "background-manager", delay },
      });

      Alert.alert(
        "Success",
        `Background notification scheduled for ${delay} seconds!`
      );
      await loadBackgroundNotifications();
    } catch (error) {
      GlobalErrorHandler.logError(
        error as Error,
        "handleTestBackgroundManager"
      );
      Alert.alert("Error", "Failed to schedule background notification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchedule10Seconds = async () => {
    try {
      setIsLoading(true);
      const scheduledFor = new Date();
      scheduledFor.setSeconds(scheduledFor.getSeconds() + 10);

      await notificationEngine.forceScheduleQuoteNotification(
        scheduledFor,
        "evening-reflection"
      );
      Alert.alert("Success", "Notification scheduled for 10 seconds from now!");
      await loadScheduledNotifications();
    } catch (error) {
      GlobalErrorHandler.logError(error as Error, "handleSchedule10Seconds");
      Alert.alert("Error", "Failed to schedule notification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackgroundTest = async () => {
    try {
      setIsLoading(true);
      await notificationEngine.scheduleAllNotifications();
      Alert.alert("Success", "All notifications scheduled!");
      await loadScheduledNotifications();
    } catch (error) {
      GlobalErrorHandler.logError(error as Error, "handleBackgroundTest");
      Alert.alert("Error", "Failed to schedule notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestVariousDelays = async () => {
    try {
      setIsLoading(true);
      const delays = [3, 8, 15]; // 3s, 8s, 15s delays
      const types: NotificationType[] = [
        "midday-reflection",
        "evening-reflection",
        "weekly-streaks",
      ];

      for (let i = 0; i < delays.length; i++) {
        const scheduledFor = new Date();
        scheduledFor.setSeconds(scheduledFor.getSeconds() + delays[i]);

        await notificationEngine.forceScheduleQuoteNotification(
          scheduledFor,
          types[i]
        );
      }

      Alert.alert(
        "Success",
        `3 notifications scheduled with delays of ${delays.join(", ")} seconds!`
      );
      await loadScheduledNotifications();
    } catch (error) {
      GlobalErrorHandler.logError(error as Error, "handleTestVariousDelays");
      Alert.alert("Error", "Failed to schedule various delay notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestImmediateVsDelayed = async () => {
    try {
      setIsLoading(true);

      // Send one immediate notification (using the original method)
      await notificationEngine.deliverNotificationNow("midday-reflection");

      // Send one delayed notification
      const scheduledFor = new Date();
      scheduledFor.setSeconds(scheduledFor.getSeconds() + 5);
      await notificationEngine.forceScheduleQuoteNotification(
        scheduledFor,
        "evening-reflection"
      );

      Alert.alert(
        "Success",
        "Sent 1 immediate notification and scheduled 1 for 5 seconds delay!"
      );
      await loadScheduledNotifications();
    } catch (error) {
      GlobalErrorHandler.logError(
        error as Error,
        "handleTestImmediateVsDelayed"
      );
      Alert.alert("Error", "Failed to test immediate vs delayed notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleMultiple = async () => {
    try {
      setIsLoading(true);
      const taskManager = BackgroundTaskManager.getInstance();

      for (let i = 1; i <= 3; i++) {
        const scheduledFor = new Date();
        scheduledFor.setSeconds(scheduledFor.getSeconds() + i * 15);

        await taskManager.scheduleNotification({
          id: `batch-${Date.now()}-${i}`,
          type: "test",
          scheduledFor,
          userId: user?.id || "test",
          title: `📬 Notification ${i} of 3`,
          body: `This is notification number ${i}, scheduled ${i * 15} seconds apart`,
          data: { batchNumber: i },
        });
      }

      Alert.alert(
        "Success",
        "3 notifications scheduled at 15-second intervals!"
      );
      await loadBackgroundNotifications();
    } catch (error) {
      GlobalErrorHandler.logError(error as Error, "handleScheduleMultiple");
      Alert.alert("Error", "Failed to schedule multiple notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAll = async () => {
    try {
      setIsLoading(true);
      await notificationEngine.cancelAllNotifications();
      Alert.alert("Success", "All notifications cancelled!");
      await loadScheduledNotifications();
      await loadBackgroundNotifications();
    } catch (error) {
      GlobalErrorHandler.logError(error as Error, "handleCancelAll");
      Alert.alert("Error", "Failed to cancel notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerNotificationNow = async (notificationId: string) => {
    try {
      const taskManager = BackgroundTaskManager.getInstance();
      await taskManager.triggerScheduledNotificationNow(notificationId);
      Alert.alert("Success", "Notification triggered immediately!");
      await loadBackgroundNotifications();
    } catch (error) {
      GlobalErrorHandler.logError(
        error as Error,
        "handleTriggerNotificationNow"
      );
      Alert.alert("Error", "Failed to trigger notification");
    }
  };

  const handleCancelScheduledNotification = async (
    notificationId: string,
    isBackground = false
  ) => {
    try {
      if (isBackground) {
        const taskManager = BackgroundTaskManager.getInstance();
        await taskManager.removeScheduledNotificationById(notificationId);
        await loadBackgroundNotifications();
      } else {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        await loadScheduledNotifications();
      }
      Alert.alert("Success", "Notification cancelled!");
    } catch (error) {
      GlobalErrorHandler.logError(
        error as Error,
        "handleCancelScheduledNotification"
      );
      Alert.alert("Error", "Failed to cancel notification");
    }
  };

  const handleResetQuoteBacklog = () => {
    try {
      resetQuoteBacklog();
      Alert.alert("Success", "Quote backlog has been reset!");
    } catch (error) {
      GlobalErrorHandler.logError(error as Error, "handleResetQuoteBacklog");
      Alert.alert("Error", "Failed to reset quote backlog");
    }
  };

  const handleRefreshData = async () => {
    try {
      setIsLoading(true);

      // Force reload notification preferences from storage
      await useNotificationStore.getState()._initialize();

      // Reload all notification data
      await loadScheduledNotifications();
      await loadBackgroundNotifications();

      Alert.alert("Success", "All notification data refreshed!");
    } catch (error) {
      GlobalErrorHandler.logError(error as Error, "handleRefreshData");
      Alert.alert("Error", "Failed to refresh notification data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepairTiming = async () => {
    try {
      setIsLoading(true);
      await repairTiming();
      Alert.alert(
        "Success",
        "Timing data has been repaired! All required time properties are now present with valid defaults."
      );
    } catch (error) {
      GlobalErrorHandler.logError(error as Error, "handleRepairTiming");
      Alert.alert("Error", "Failed to repair timing data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInAppNotification = async () => {
    try {
      setIsLoading(true);
      await notificationEngine.deliverNotificationNow("weekly-streaks");
      Alert.alert("Success", "In-app notification sent!");
    } catch (error) {
      GlobalErrorHandler.logError(
        error as Error,
        "handleSendInAppNotification"
      );
      Alert.alert("Error", "Failed to send in-app notification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendDelayedInAppNotification = async () => {
    try {
      setIsLoading(true);
      const delay = parseInt(delaySeconds) || 5;

      // Use setTimeout to simulate a delayed in-app notification
      setTimeout(async () => {
        try {
          await notificationEngine.deliverNotificationNow(
            selectedNotificationType
          );
          Alert.alert(
            "Delayed In-App Notification",
            `In-app notification delivered after ${delay} seconds delay!`
          );
        } catch (error) {
          GlobalErrorHandler.logError(
            error as Error,
            "handleSendDelayedInAppNotification.timeout"
          );
          Alert.alert("Error", "Failed to deliver delayed in-app notification");
        }
      }, delay * 1000);

      Alert.alert(
        "Delayed In-App Scheduled",
        `In-app notification will appear in ${delay} seconds (${selectedNotificationType})`
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error as Error,
        "handleSendDelayedInAppNotification"
      );
      Alert.alert("Error", "Failed to schedule delayed in-app notification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMultipleInApp = async () => {
    try {
      setIsLoading(true);

      // Send three different types of notifications
      await notificationEngine.deliverNotificationNow("midday-reflection");
      await notificationEngine.deliverNotificationNow("evening-reflection");
      await notificationEngine.deliverNotificationNow("weekly-streaks");

      Alert.alert("Success", "Multiple notifications sent!");
    } catch (error) {
      GlobalErrorHandler.logError(error as Error, "handleSendMultipleInApp");
      Alert.alert("Error", "Failed to send multiple notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestScheduleAll = async () => {
    try {
      setIsLoading(true);
      await notificationEngine.scheduleAllNotifications();
      Alert.alert("Success", "All notification preferences scheduled!");
      await loadScheduledNotifications();
    } catch (error) {
      GlobalErrorHandler.logError(error as Error, "handleTestScheduleAll");
      Alert.alert("Error", "Failed to schedule notifications");
    } finally {
      setIsLoading(false);
    }
  };

  // Toast demonstration functions
  const handleTestToastSuccess = () => {
    ToastService.show({
      title: "Success!",
      body: "Operation completed successfully",
      type: "success",
      duration: 3000,
    });
  };

  const handleTestToastError = () => {
    ToastService.show({
      title: "Error",
      body: "Something went wrong. Please try again.",
      type: "error",
      duration: 4000,
    });
  };

  const handleTestToastWarning = () => {
    ToastService.show({
      title: "Warning",
      body: "Please check your settings before continuing",
      type: "warning",
      duration: 3500,
    });
  };

  const handleTestToastInfo = () => {
    ToastService.show({
      title: "Information",
      body: "This is helpful information for you to know",
      type: "info",
      duration: 4000,
    });
  };

  const handleTestToastNavigation = () => {
    ToastService.show({
      title: "Navigation Toast",
      body: "Tap to navigate to notifications settings",
      type: "info",
      duration: 5000,
      href: "/settings/notifications",
    });
  };

  const handleTestToastCustomAction = () => {
    ToastService.show({
      title: "Custom Action",
      body: "Tap for a custom action",
      type: "success",
      duration: 5000,
      onPress: () => {
        alert("Custom action triggered!");
      },
    });
  };

  const renderQuoteBacklogInfo = () => {
    const availableQuotes = cadenceMessages.filter(
      (quote) => !usedQuoteIds.includes(quote.id)
    );
    const usedQuotes = cadenceMessages.filter((quote) =>
      usedQuoteIds.includes(quote.id)
    );

    return (
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>📚 Quote Backlog Status</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total Quotes:</Text>
          <Text style={styles.infoValue}>{cadenceMessages.length}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Available:</Text>
          <Text style={[styles.infoValue, styles.successText]}>
            {availableQuotes.length}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Used:</Text>
          <Text style={[styles.infoValue, styles.dangerText]}>
            {usedQuotes.length}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Next Index:</Text>
          <Text style={styles.infoValue}>{nextQuoteIndex}</Text>
        </View>
      </View>
    );
  };

  const renderNotificationPreferences = () => {
    return (
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>⚙️ Current Preferences</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Morning Reminders:</Text>
          <Text style={styles.infoValue}>
            {preferences.morningReminders ? "✅" : "❌"} @ {timing.morningTime}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Midday Reflection:</Text>
          <Text style={styles.infoValue}>
            {preferences.middayReflection ? "✅" : "❌"} @ {timing.middayTime}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Evening Reminders:</Text>
          <Text style={styles.infoValue}>
            {preferences.eveningReminders ? "✅" : "❌"} @ {timing.eveningTime}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Weekly Streaks:</Text>
          <Text style={styles.infoValue}>
            {preferences.weeklyStreaks ? "✅" : "❌"}
          </Text>
        </View>
      </View>
    );
  };

  const formatTriggerInfo = (trigger: Record<string, unknown>): string => {
    const triggerType =
      typeof trigger.type === "string" ? trigger.type : "immediate";
    let result = `Trigger: ${triggerType}`;

    if (
      trigger.dateComponents &&
      typeof trigger.dateComponents === "object" &&
      trigger.dateComponents !== null &&
      "hour" in trigger.dateComponents &&
      "minute" in trigger.dateComponents &&
      typeof trigger.dateComponents.hour === "number" &&
      typeof trigger.dateComponents.minute === "number"
    ) {
      result += ` @ ${trigger.dateComponents.hour}:${String(trigger.dateComponents.minute).padStart(2, "0")}`;
    } else if (trigger.seconds && typeof trigger.seconds === "number") {
      result += ` in ${trigger.seconds}s`;
    }

    return result;
  };

  const renderScheduledNotificationsList = () => {
    if (scheduledNotifications.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No scheduled notifications</Text>
        </View>
      );
    }

    return (
      <View>
        {scheduledNotifications.map((item) => (
          <View key={item.identifier} style={styles.notificationItem}>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{item.content.title}</Text>
              <Text style={styles.notificationBody}>{item.content.body}</Text>
              <Text style={styles.notificationTrigger}>
                {formatTriggerInfo(item.trigger || {})}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelScheduledNotification(item.identifier)}
              hitSlop={HIT_SLOP_10}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const renderBackgroundNotificationsList = () => {
    if (backgroundNotifications.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No background notifications</Text>
        </View>
      );
    }

    return (
      <View>
        {backgroundNotifications.map((item) => (
          <View key={item.id} style={styles.notificationItem}>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationBody}>{item.body}</Text>
              <Text style={styles.notificationTrigger}>
                Scheduled for: {new Date(item.scheduledFor).toLocaleString()}
              </Text>
              <Text style={styles.notificationMeta}>
                Type: {item.type} | User: {item.userId}
              </Text>
            </View>
            <View style={styles.notificationActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.triggerButton]}
                onPress={() => handleTriggerNotificationNow(item.id)}
                hitSlop={HIT_SLOP_10}
              >
                <Text style={styles.actionButtonText}>Trigger Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleCancelScheduledNotification(item.id, true)}
                hitSlop={HIT_SLOP_10}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t("profile.development.test-notifications"),
          headerStyle: {
            backgroundColor: "transparent",
          },
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push("/profile")}
              hitSlop={HIT_SLOP_10}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={[styles.backButton, styles.refreshButton]}
              onPress={handleRefreshData}
              disabled={isLoading}
              hitSlop={HIT_SLOP_10}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Text style={[styles.backButtonText, styles.refreshButtonText]}>
                  🔄
                </Text>
              )}
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Status</Text>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Permissions:</Text>
            <Text style={styles.statusValue}>
              {permissionStatus === "granted" ? "✅ Granted" : "❌ Not Granted"}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Notification Engine:</Text>
            <Text style={styles.statusValue}>
              {isInitialized ? "✅ Ready" : "⏳ Initializing"}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>User ID:</Text>
            <Text style={styles.statusValue}>
              {user?.id ? user.id.substring(0, 8) + "..." : "Not logged in"}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Permission Status:</Text>
            <Text style={styles.statusValue}>{permissionStatus}</Text>
          </View>
        </View>

        {renderQuoteBacklogInfo()}
        {renderNotificationPreferences()}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Configuration</Text>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Delay (seconds):</Text>
            <TextInput
              style={styles.textInput}
              value={delaySeconds}
              onChangeText={setDelaySeconds}
              keyboardType="numeric"
              placeholder="5"
            />
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Notification Type:</Text>
            <View style={styles.typeSelector}>
              {(
                [
                  "midday-reflection",
                  "evening-reflection",
                  "weekly-streaks",
                ] as NotificationType[]
              ).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    selectedNotificationType === type &&
                      styles.typeButtonSelected,
                  ]}
                  onPress={() => setSelectedNotificationType(type)}
                  hitSlop={HIT_SLOP_10}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedNotificationType === type &&
                        styles.typeButtonTextSelected,
                    ]}
                  >
                    {type.replace("-", " ")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Permission Management</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handleRequestPermissions}
            disabled={isLoading || permissionStatus === "granted"}
            hitSlop={HIT_SLOP_10}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {permissionStatus === "granted"
                  ? "Permissions Granted"
                  : "Request Permissions"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🚀 Enhanced Push Notifications
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleSendImmediate}
            disabled={isLoading || permissionStatus !== "granted"}
            hitSlop={HIT_SLOP_10}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                Send Immediate ({selectedNotificationType})
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleScheduleDelayed}
            disabled={isLoading || permissionStatus !== "granted"}
            hitSlop={HIT_SLOP_10}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                Schedule Delayed ({delaySeconds}s)
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleScheduleMultipleWithDelay}
            disabled={isLoading || permissionStatus !== "granted"}
            hitSlop={HIT_SLOP_10}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                Schedule Multiple Types (10s intervals)
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonTertiary]}
            onPress={handleTestBackgroundManager}
            disabled={isLoading || permissionStatus !== "granted"}
            hitSlop={HIT_SLOP_10}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Test Background Manager</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonInfo]}
            onPress={handleTestVariousDelays}
            disabled={isLoading || permissionStatus !== "granted"}
            hitSlop={HIT_SLOP_10}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                Test Various Delays (3s, 8s, 15s)
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonWarning]}
            onPress={handleTestImmediateVsDelayed}
            disabled={isLoading || permissionStatus !== "granted"}
            hitSlop={HIT_SLOP_10}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Immediate vs Delayed Test</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Notifications</Text>

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleSchedule10Seconds}
            disabled={isLoading || permissionStatus !== "granted"}
            hitSlop={HIT_SLOP_10}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Schedule (10 seconds)</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Testing</Text>

          <TouchableOpacity
            style={[styles.button, styles.buttonTertiary]}
            onPress={handleSendInAppNotification}
            disabled={isLoading}
            hitSlop={HIT_SLOP_10}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Test Weekly Streak Quote</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonInfo]}
            onPress={handleSendDelayedInAppNotification}
            disabled={isLoading}
            hitSlop={HIT_SLOP_10}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                Delayed In-App ({delaySeconds}s) - {selectedNotificationType}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonTertiary]}
            onPress={handleSendMultipleInApp}
            disabled={isLoading}
            hitSlop={HIT_SLOP_10}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Test All Quote Types</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonQuaternary]}
            onPress={handleTestScheduleAll}
            disabled={isLoading}
            hitSlop={HIT_SLOP_10}
          >
            <Text style={styles.buttonText}>Schedule All Notifications</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Engine Tests</Text>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleBackgroundTest}
            disabled={
              isLoading || !isInitialized || permissionStatus !== "granted"
            }
            hitSlop={HIT_SLOP_10}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Test Engine Schedule All</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleScheduleMultiple}
            disabled={
              isLoading || !isInitialized || permissionStatus !== "granted"
            }
            hitSlop={HIT_SLOP_10}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                Schedule 3 Test Notifications
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Toast Testing</Text>

          <TouchableOpacity
            style={[styles.button, styles.buttonSuccess]}
            onPress={handleTestToastSuccess}
            disabled={isLoading}
            hitSlop={HIT_SLOP_10}
          >
            <Text style={styles.buttonText}>Test Success Toast</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={handleTestToastError}
            disabled={isLoading}
            hitSlop={HIT_SLOP_10}
          >
            <Text style={styles.buttonText}>Test Error Toast</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonWarning]}
            onPress={handleTestToastWarning}
            disabled={isLoading}
            hitSlop={HIT_SLOP_10}
          >
            <Text style={styles.buttonText}>Test Warning Toast</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonInfo]}
            onPress={handleTestToastInfo}
            disabled={isLoading}
            hitSlop={HIT_SLOP_10}
          >
            <Text style={styles.buttonText}>Test Info Toast</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleTestToastNavigation}
            disabled={isLoading}
            hitSlop={HIT_SLOP_10}
          >
            <Text style={styles.buttonText}>Toast with Navigation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonTertiary]}
            onPress={handleTestToastCustomAction}
            disabled={isLoading}
            hitSlop={HIT_SLOP_10}
          >
            <Text style={styles.buttonText}>Toast with Custom Action</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📋 Scheduled Notifications ({scheduledNotifications.length})
          </Text>
          {renderScheduledNotificationsList()}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🔄 Background Notifications ({backgroundNotifications.length})
          </Text>
          {renderBackgroundNotificationsList()}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management</Text>
          <TouchableOpacity
            style={[styles.button, styles.buttonInfo]}
            onPress={handleRefreshData}
            disabled={isLoading}
            hitSlop={HIT_SLOP_10}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>🔄 Refresh All Data</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonWarning]}
            onPress={handleRepairTiming}
            disabled={isLoading}
            hitSlop={HIT_SLOP_10}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>🔧 Repair Timing Data</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonWarning]}
            onPress={handleResetQuoteBacklog}
            disabled={isLoading}
            hitSlop={HIT_SLOP_10}
          >
            <Text style={styles.buttonText}>Reset Quote Backlog</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={handleCancelAll}
            disabled={isLoading}
            hitSlop={HIT_SLOP_10}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Cancel All Notifications</Text>
            )}
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.processingIndicator}>
            <ActivityIndicator color="#007bff" />
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
  },
  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  statusItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  statusLabel: {
    fontSize: 14,
    color: "#666",
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 12,
    borderRadius: 6,
  },
  backButtonText: {
    fontSize: 16,
    color: "#007AFF",
  },
  refreshButton: {
    marginLeft: 12,
  },
  refreshButtonText: {
    fontSize: 18,
    color: "#007AFF",
  },
  button: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonPrimary: {
    backgroundColor: "#007bff",
  },
  buttonSecondary: {
    backgroundColor: "#6c757d",
  },
  buttonTertiary: {
    backgroundColor: COLORS.tertiary,
  },
  buttonQuaternary: {
    backgroundColor: COLORS.quaternary,
  },
  buttonDanger: {
    backgroundColor: "#dc3545",
  },
  buttonSuccess: {
    backgroundColor: "#28a745",
  },
  buttonWarning: {
    backgroundColor: "#ffc107",
  },
  buttonInfo: {
    backgroundColor: "#17a2b8",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  processingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    marginTop: 20,
  },
  processingText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#007bff",
  },
  // New styles for enhanced functionality
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    textAlign: "right",
  },
  configRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  configLabel: {
    fontSize: 14,
    color: "#333",
    marginRight: 12,
    minWidth: 120,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  typeSelector: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f8f9fa",
  },
  typeButtonSelected: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  typeButtonText: {
    fontSize: 12,
    color: "#666",
    textTransform: "capitalize",
  },
  typeButtonTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginTop: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  notificationItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  notificationContent: {
    flex: 1,
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
    lineHeight: 18,
  },
  notificationTrigger: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  notificationMeta: {
    fontSize: 11,
    color: "#aaa",
    fontStyle: "italic",
  },
  notificationActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 80,
    alignItems: "center",
  },
  triggerButton: {
    backgroundColor: "#28a745",
  },
  cancelButton: {
    backgroundColor: "#dc3545",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  successText: {
    color: "#28a745",
  },
  dangerText: {
    color: "#dc3545",
  },
});
