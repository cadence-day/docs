import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNotifications } from "@/shared/notifications/context/NotificationContext";
import { useBackgroundNotifications } from "@/shared/notifications/hooks/useBackgroundNotifications";
import { BackgroundTaskManager } from "@/shared/notifications/services/BackgroundTaskManager";
import { useUser } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

export default function TestNotifications() {
  const { user } = useUser();
  const {
    sendNotification,
    scheduleNotification,
    cancelAllNotifications,
    requestPermissions,
    permissionStatus,
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
      Alert.alert("Error", "Failed to cancel notifications");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Test Notifications",
          headerShown: true,
          headerBackVisible: true, // Show back button
          headerBackTitle: "Back", // Optional: customize back button text
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
  buttonDanger: {
    backgroundColor: "#dc3545",
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
