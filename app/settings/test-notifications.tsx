import { COLORS } from "@/shared/constants/COLORS";
import { ToastService } from "@/shared/context/ToastProvider";
import { useNotifications } from "@/shared/notifications/context/NotificationContext";
import { useBackgroundNotifications } from "@/shared/notifications/hooks/useBackgroundNotifications";
import { notificationEngineSingleton } from "@/shared/notifications/NotificationEngineSingleton";
import { BackgroundTaskManager } from "@/shared/notifications/services/BackgroundTaskManager";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TestNotifications() {
  const { user } = useUser();
  const { t } = useTranslation();
  const {
    sendNotification,
    scheduleNotification,
    cancelAllNotifications,
    requestPermissions,
    permissionStatus,
    inAppNotifications,
    unreadCount,
    markAllAsRead,
    clearNotificationHistory,
  } = useNotifications();
  const { scheduleTestNotification, isInitialized, isProcessing } =
    useBackgroundNotifications();
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestPermissions = async () => {
    try {
      const status = await requestPermissions();
      Alert.alert(
        "Permission Status",
        `Granted: ${status.granted}\nStatus: ${status.status}`
      );
    } catch (error) {
      GlobalErrorHandler.logError(error as Error, "handleRequestPermissions");
      Alert.alert("Error", "Failed to request permissions");
    }
  };

  const handleSendImmediate = async () => {
    try {
      setIsLoading(true);
      await sendNotification({
        id: `immediate-${Date.now()}`,
        title: "🎯 Immediate Notification",
        body: "This notification was sent immediately!",
        type: "test",
      });
      Alert.alert("Success", "Immediate notification sent!");
    } catch (error) {
      GlobalErrorHandler.logError(error as Error, "handleSendImmediate");
      Alert.alert("Error", "Failed to send notification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchedule10Seconds = async () => {
    try {
      setIsLoading(true);
      const scheduledFor = new Date();
      scheduledFor.setSeconds(scheduledFor.getSeconds() + 10);

      await scheduleNotification(
        {
          id: `scheduled-${Date.now()}`,
          title: "⏰ Scheduled Notification",
          body: "This was scheduled 10 seconds ago!",
          type: "test",
        },
        scheduledFor
      );
      Alert.alert("Success", "Notification scheduled for 10 seconds from now!");
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
      await scheduleTestNotification();
      Alert.alert("Success", "Background test notification scheduled!");
    } catch (error) {
      GlobalErrorHandler.logError(error as Error, "handleBackgroundTest");
      Alert.alert("Error", "Failed to schedule background notification");
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
      await cancelAllNotifications();
      Alert.alert("Success", "All notifications cancelled!");
    } catch (error) {
      GlobalErrorHandler.logError(error as Error, "handleCancelAll");
      Alert.alert("Error", "Failed to cancel notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInAppNotification = async () => {
    try {
      setIsLoading(true);
      const engine = await notificationEngineSingleton.getInstance();

      await engine.emit({
        type: "system",
        deliveryMethod: ["in-app"],
        message: {
          id: `in-app-${Date.now()}`,
          title: "📱 In-App Notification",
          body: "This is a test in-app notification that appears directly in the app!",
          type: "system",
          metadata: { testType: "in-app" },
        },
        userId: user?.id || "test",
      });

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

  const handleSendMultipleInApp = async () => {
    try {
      setIsLoading(true);
      const engine = await notificationEngineSingleton.getInstance();

      const notifications = [
        {
          title: "🎯 Success Notification",
          body: "This is a success notification with auto-hide",
          type: "achievement" as const,
        },
        {
          title: "⚠️ Warning Notification",
          body: "This is a warning notification",
          type: "reminder" as const,
        },
        {
          title: "ℹ️ Info Notification",
          body: "This is an info notification that persists",
          type: "system" as const,
        },
      ];

      for (let i = 0; i < notifications.length; i++) {
        const notification = notifications[i];
        await engine.emit({
          type: notification.type,
          deliveryMethod: ["in-app"],
          message: {
            id: `in-app-multi-${Date.now()}-${i}`,
            title: notification.title,
            body: notification.body,
            type: notification.type,
            metadata: { testType: "multi-in-app", sequence: i + 1 },
          },
          userId: user?.id || "test",
        });

        // Small delay between notifications
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      Alert.alert("Success", "Multiple in-app notifications sent!");
    } catch (error) {
      GlobalErrorHandler.logError(error as Error, "handleSendMultipleInApp");
      Alert.alert("Error", "Failed to send multiple in-app notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearInAppHistory = async () => {
    try {
      setIsLoading(true);
      clearNotificationHistory();
      Alert.alert("Success", "In-app notification history cleared!");
    } catch (error) {
      GlobalErrorHandler.logError(error as Error, "handleClearInAppHistory");
      Alert.alert("Error", "Failed to clear notification history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      markAllAsRead();
      Alert.alert("Success", "All in-app notifications marked as read!");
    } catch (error) {
      GlobalErrorHandler.logError(error as Error, "handleMarkAllAsRead");
      Alert.alert("Error", "Failed to mark notifications as read");
    }
  };

  // Toast demonstration functions
  const handleTestToastSuccess = () => {
    ToastService.show({
      message: "✅ This is a success toast message!",
      type: "success",
      duration: 3000,
    });
  };

  const handleTestToastError = () => {
    ToastService.show({
      message: "❌ This is an error toast showing an issue!",
      type: "error",
      duration: 4000,
    });
  };

  const handleTestToastWarning = () => {
    ToastService.show({
      message: "⚠️ This is a warning toast!",
      type: "warning",
      duration: 3500,
    });
  };

  const handleTestToastInfo = () => {
    ToastService.show({
      message: "ℹ️ This is an info toast with useful information!",
      type: "info",
      duration: 4000,
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t("profile.development.test-notifications"),
          headerShown: true,
          headerStyle: {
            backgroundColor: COLORS.light.background,
          },
          headerShadowVisible: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push("/profile")}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
              <Text style={styles.backText}>{t("settings.back")}</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Status</Text>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Permissions:</Text>
              <Text style={styles.statusValue}>
                {permissionStatus.granted ? "✅ Granted" : "❌ Not Granted"}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Background Tasks:</Text>
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
              <Text style={styles.statusLabel}>In-App Notifications:</Text>
              <Text style={styles.statusValue}>
                {inAppNotifications.length > 0
                  ? `${inAppNotifications.length} total, ${unreadCount} unread`
                  : "None"}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Permission Management</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={handleRequestPermissions}
              disabled={isLoading || permissionStatus.granted}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {permissionStatus.granted
                    ? "Permissions Granted"
                    : "Request Permissions"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Notifications</Text>

            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleSendImmediate}
              disabled={isLoading || !permissionStatus.granted}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send Immediate</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleSchedule10Seconds}
              disabled={isLoading || !permissionStatus.granted}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Schedule (10 seconds)</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>In-App Notifications</Text>

            <TouchableOpacity
              style={[styles.button, styles.buttonTertiary]}
              onPress={handleSendInAppNotification}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send In-App Notification</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonTertiary]}
              onPress={handleSendMultipleInApp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send Multiple In-App</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonQuaternary]}
              onPress={handleMarkAllAsRead}
              disabled={isLoading || unreadCount === 0}
            >
              <Text style={styles.buttonText}>
                {unreadCount > 0 ? `Mark ${unreadCount} as Read` : "All Read"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonQuaternary]}
              onPress={handleClearInAppHistory}
              disabled={isLoading || inAppNotifications.length === 0}
            >
              <Text style={styles.buttonText}>
                {inAppNotifications.length > 0
                  ? `Clear History (${inAppNotifications.length})`
                  : "No History"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Background Task Tests</Text>

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleBackgroundTest}
              disabled={
                isLoading || !isInitialized || !permissionStatus.granted
              }
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Test Background Task</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleScheduleMultiple}
              disabled={
                isLoading || !isInitialized || !permissionStatus.granted
              }
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Schedule 3 Notifications</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Toast Testing</Text>

            <TouchableOpacity
              style={[styles.button, styles.buttonSuccess]}
              onPress={handleTestToastSuccess}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Test Success Toast</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonDanger]}
              onPress={handleTestToastError}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Test Error Toast</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonWarning]}
              onPress={handleTestToastWarning}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Test Warning Toast</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonInfo]}
              onPress={handleTestToastInfo}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Test Info Toast</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Management</Text>

            <TouchableOpacity
              style={[styles.button, styles.buttonDanger]}
              onPress={handleCancelAll}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Cancel All Notifications</Text>
              )}
            </TouchableOpacity>
          </View>

          {isProcessing && (
            <View style={styles.processingIndicator}>
              <ActivityIndicator color="#007bff" />
              <Text style={styles.processingText}>
                Processing background tasks...
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 20,
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
});
