import useDetectNewDevice from "@/features/debug/hooks/useDetectNewDevice";
import { BackgroundTaskManager } from "@/shared/notifications/services/BackgroundTaskManager";
import { userOnboardingStorage } from "@/shared/storage/user/onboarding";
import useDialogStore from "@/shared/stores/useDialogStore";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
      // eslint-disable-next-line no-console
      console.error("Failed to load background tasks", err);
    }
  };

  useEffect(() => {
    void loadTasks();
  }, []);

  const handleRemove = async (id: string) => {
    try {
      const mgr = BackgroundTaskManager.getInstance();
      await mgr.removeScheduledNotificationById(id);
      await loadTasks();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to remove scheduled notification", err);
    }
  };

  const handleTriggerNow = async (id: string) => {
    try {
      const mgr = BackgroundTaskManager.getInstance();
      await mgr.triggerScheduledNotificationNow(id);
      await loadTasks();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to trigger scheduled notification", err);
    }
  };

  const handleShowOnboardingDebug = async () => {
    try {
      await userOnboardingStorage.clearShown();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("clear onboarding storage failed", error);
    }

    router.push("/onboarding");
  };

  const handleOpenDebugPage = () => {
    try {
      router.push("/debug");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("open debug page failed", error);
    }
  };

  return (
    <View style={styles.body}>
      {/* List of buttons using TouchableOpacity for custom styling */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleShowOnboardingDebug}
      >
        <Text style={styles.buttonText}>Show Onboarding</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleOpenDebugPage}>
        <Text style={styles.buttonText}>Open Debug</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/test-notifications")}
      >
        <Text style={styles.buttonText}>Test Notifications</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={detect} style={styles.button}>
        <Text style={styles.buttonText}>
          {isLoading ? "Checking..." : "Test Encryption New Device"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          openDialog({
            type: "encryption-link",
            props: {
              headerProps: {
                title: "Link This Device",
              },
              height: 85,
              enableDragging: false,
            },
            position: "dock",
          })
        }
      >
        <Text style={styles.buttonText}>Open Encryption Link Dialog</Text>
      </TouchableOpacity>
      {detectResult ? (
        <Text style={styles.resultText}>{detectResult}</Text>
      ) : null}
      {/* Background tasks list */}
      <View style={{ marginTop: 12 }}>
        <Text style={{ color: "#fff", marginBottom: 8 }}>Background Tasks</Text>
        {tasks.length === 0 ? (
          <Text style={styles.resultText}>No scheduled background tasks</Text>
        ) : (
          tasks.map((t) => (
            <View
              key={t.id}
              style={{
                backgroundColor: "#0056b3",
                padding: 8,
                borderRadius: 6,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                {t.title}
              </Text>
              <Text style={{ color: "#fff", fontSize: 12 }}>
                {new Date(t.scheduledFor).toLocaleString()}
              </Text>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    { paddingVertical: 8, paddingHorizontal: 12 },
                  ]}
                  onPress={() => void handleTriggerNow(t.id)}
                >
                  <Text style={styles.buttonText}>Trigger Now</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    {
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      backgroundColor: "#cc0000",
                    },
                  ]}
                  onPress={() => void handleRemove(t.id)}
                >
                  <Text style={styles.buttonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <TouchableOpacity
          style={[styles.button, { marginTop: 8 }]}
          onPress={() => void loadTasks()}
        >
          <Text style={styles.buttonText}>Refresh Tasks</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DebugPanel;

const styles = StyleSheet.create({
  body: {
    gap: 12,
    marginTop: 8,
    backgroundColor: "#007bff66",
    padding: 12,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  resultText: {
    color: "#fff",
    marginTop: 6,
  },
});
