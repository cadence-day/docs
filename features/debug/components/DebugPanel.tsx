import useDetectNewDevice from "@/features/debug/hooks/useDetectNewDevice";
import useTranslation from "@/shared/hooks/useI18n";
import { userOnboardingStorage } from "@/shared/storage/user/onboarding";
import useDialogStore from "@/shared/stores/useDialogStore";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const DebugPanel: React.FC = () => {
  const router = useRouter();
  const openDialog = useDialogStore((s) => s.openDialog);
  const { t } = useTranslation();
  const { detect, isLoading, detectResult } = useDetectNewDevice();

  const handleShowOnboardingDebug = async () => {
    try {
      await userOnboardingStorage.clearShown();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("clear onboarding storage failed", error);
    }

    openDialog({
      type: "onboarding",
      props: {
        height: 85,
        enableDragging: false,
        headerProps: {
          title: t("welcome-to-cadence"),
          rightActionElement: t("common.close"),
          onRightAction: () => {
            useDialogStore.getState().closeAll();
          },
        },
      },
      position: "dock",
      viewSpecific: "profile",
    });
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
