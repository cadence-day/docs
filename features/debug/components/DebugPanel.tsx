import useDetectNewDevice from "@/features/debug/hooks/useDetectNewDevice";
import { BackgroundTaskManager } from "@/shared/notifications/services/BackgroundTaskManager";
import { userOnboardingStorage } from "@/shared/storage/user/onboarding";
import useDialogStore from "@/shared/stores/useDialogStore";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { debugStyles } from "../styles";

type ScheduledNotificationView = {
  id: string;
  title: string;
  scheduledFor: string; // ISO
  type: string;
};

const DebugPanel: React.FC = () => {
  const router = useRouter();
  const openDialog = useDialogStore((s) => s.openDialog);
  const { detect, isLoading, detectResult } = useDetectNewDevice();
  const [tasks, setTasks] = useState<ScheduledNotificationView[]>([]);
  const [notificationStatus, setNotificationStatus] =
    useState<string>("unknown");

  const loadTasks = async () => {
    try {
      const mgr = BackgroundTaskManager.getInstance();
      const list = await mgr.listScheduledNotifications();
      const view = list.map((n) => ({
        id: n.id,
        title: n.title,
        scheduledFor: new Date(n.scheduledFor).toISOString(),
        type: n.type,
      }));
      setTasks(view);
    } catch (err) {
      GlobalErrorHandler.logError(err, "Failed to load background tasks");
    }
  };

  const checkNotificationStatus = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationStatus(status);
    } catch {
      setNotificationStatus("error");
    }
  };

  useEffect(() => {
    void loadTasks();
    void checkNotificationStatus();
  }, []);

  const handleRemove = async (id: string) => {
    try {
      const mgr = BackgroundTaskManager.getInstance();
      await mgr.removeScheduledNotificationById(id);
      await loadTasks();
    } catch (err) {
      GlobalErrorHandler.logError(
        err,
        "Failed to remove scheduled notification"
      );
    }
  };

  const handleTriggerNow = async (id: string) => {
    try {
      const mgr = BackgroundTaskManager.getInstance();
      await mgr.triggerScheduledNotificationNow(id);
      await loadTasks();
    } catch (err) {
      GlobalErrorHandler.logError(
        err,
        "Failed to trigger scheduled notification"
      );
    }
  };

  const handleShowOnboardingDebug = async () => {
    try {
      await userOnboardingStorage.clearShown();
    } catch (error) {
      GlobalErrorHandler.logError(error, "clear onboarding storage failed");
    }

    router.push("/onboarding");
  };

  const handleOpenDebugPage = () => {
    try {
      router.push("/debug");
    } catch (error) {
      GlobalErrorHandler.logError(error, "open debug page failed");
    }
  };

  const handleSuppressNotificationPermissions = () => {
    Alert.alert(
      "Suppress Notification Permissions",
      "This will simulate denied notification permissions. You'll need to go to device settings to re-enable them.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Suppress",
          style: "destructive",
          onPress: async () => {
            try {
              // Note: We can't actually revoke permissions programmatically on iOS/Android
              // But we can show the user how to do it manually
              Alert.alert(
                "Manual Action Required",
                "To suppress notification permissions:\n\n1. Go to device Settings\n2. Find this app\n3. Turn off Notifications\n4. Return to app to test onboarding flow",
                [
                  {
                    text: "OK",
                    onPress: () => checkNotificationStatus(),
                  },
                ]
              );
            } catch (error) {
              GlobalErrorHandler.logError(
                error,
                "Failed to suppress notification permissions"
              );
              Alert.alert(
                "Error",
                "Failed to suppress notification permissions"
              );
            }
          },
        },
      ]
    );
  };

  const handleShowAppUpdateDialog = (required: boolean) => {
    try {
      openDialog({
        type: "app-update",
        props: {
          versionInfo: {
            updateAvailable: true,
            updateRequired: required,
            currentVersion: "2.0.0",
            latestVersion: "2.1.0",
            storeUrl: "https://apps.apple.com/app/cadence-day/id123456789",
          },
          onUpdateLater: () => {
            GlobalErrorHandler.logDebug(
              "User chose to update later",
              "DEBUG_PANEL"
            );
          },
          headerProps: {
            title: required ? "Update Required" : "New Version Available",
            backAction: !required,
          },
          enableDragging: false,
        },
        position: "dock",
      });
    } catch (error) {
      GlobalErrorHandler.logError(error, "Failed to show app update dialog");
    }
  };

  return (
    <View style={debugStyles.debugPanelBody}>
      {/* Notification Status Display */}
      <View style={debugStyles.debugPanelStatusContainer}>
        <Text style={debugStyles.debugPanelStatusText}>
          Notification Status: {notificationStatus}
        </Text>
        <TouchableOpacity
          style={[
            debugStyles.debugPanelButton,
            debugStyles.debugPanelCompactButton,
          ]}
          onPress={() => checkNotificationStatus()}
        >
          <Text
            style={[
              debugStyles.debugPanelButtonText,
              debugStyles.debugPanelButtonTextSmall,
            ]}
          >
            Refresh
          </Text>
        </TouchableOpacity>
      </View>

      {/* List of buttons using TouchableOpacity for custom styling */}
      <TouchableOpacity
        style={debugStyles.debugPanelButton}
        onPress={handleShowOnboardingDebug}
      >
        <Text style={debugStyles.debugPanelButtonText}>Show Onboarding</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={debugStyles.debugPanelButton}
        onPress={handleOpenDebugPage}
      >
        <Text style={debugStyles.debugPanelButtonText}>Open Debug</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={debugStyles.debugPanelButton}
        onPress={() => router.push("/test-notifications")}
      >
        <Text style={debugStyles.debugPanelButtonText}>Test Notifications</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={debugStyles.debugPanelButton}
        onPress={() => router.push("/test-revenuecat")}
      >
        <Text style={debugStyles.debugPanelButtonText}>Test RevenueCat</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={debugStyles.debugPanelButton}
        onPress={() => handleShowAppUpdateDialog(false)}
      >
        <Text style={debugStyles.debugPanelButtonText}>
          Show App Update (Optional)
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          debugStyles.debugPanelButton,
          debugStyles.debugPanelWarningButton,
        ]}
        onPress={() => handleShowAppUpdateDialog(true)}
      >
        <Text style={debugStyles.debugPanelButtonText}>
          Show App Update (Required)
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          debugStyles.debugPanelButton,
          debugStyles.debugPanelWarningButton,
        ]}
        onPress={handleSuppressNotificationPermissions}
      >
        <Text style={debugStyles.debugPanelButtonText}>
          Suppress Notification Permissions
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={detect} style={debugStyles.debugPanelButton}>
        <Text style={debugStyles.debugPanelButtonText}>
          {isLoading ? "Checking..." : "Test Encryption New Device"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={debugStyles.debugPanelButton}
        onPress={() =>
          openDialog({
            type: "encryption-link",
            props: {
              headerProps: {
                title: "Link This Device",
              },
              height: 100,
              enableDragging: false,
            },
            position: "dock",
          })
        }
      >
        <Text style={debugStyles.debugPanelButtonText}>
          Open Encryption Link Dialog
        </Text>
      </TouchableOpacity>
      {detectResult ? (
        <Text style={debugStyles.debugPanelResultText}>{detectResult}</Text>
      ) : null}
      {/* Background tasks list */}
      <View style={debugStyles.debugPanelSectionContainer}>
        <Text style={debugStyles.debugPanelSectionTitle}>Background Tasks</Text>
        {tasks.length === 0 ? (
          <Text style={debugStyles.debugPanelResultText}>
            No scheduled background tasks
          </Text>
        ) : (
          tasks.map((t) => (
            <View
              key={t.id}
              style={debugStyles.debugPanelNotificationContainer}
            >
              <Text style={debugStyles.debugPanelNotificationTitle}>
                {t.title}
              </Text>
              <Text style={debugStyles.debugPanelNotificationText}>
                {new Date(t.scheduledFor).toLocaleString()}
              </Text>
              <View style={debugStyles.debugPanelButtonRow}>
                <TouchableOpacity
                  style={[
                    debugStyles.debugPanelButton,
                    debugStyles.debugPanelCompactButton,
                  ]}
                  onPress={() => void handleTriggerNow(t.id)}
                >
                  <Text style={debugStyles.debugPanelButtonText}>
                    Trigger Now
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    debugStyles.debugPanelButton,
                    debugStyles.debugPanelCompactButton,
                    debugStyles.debugPanelDangerButton,
                  ]}
                  onPress={() => void handleRemove(t.id)}
                >
                  <Text style={debugStyles.debugPanelButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <TouchableOpacity
          style={[
            debugStyles.debugPanelButton,
            debugStyles.debugPanelButtonWithTopMargin,
          ]}
          onPress={() => void loadTasks()}
        >
          <Text style={debugStyles.debugPanelButtonText}>Refresh Tasks</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DebugPanel;
