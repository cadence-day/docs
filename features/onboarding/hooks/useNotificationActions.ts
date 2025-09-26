import { Alert } from "react-native";
import { GlobalErrorHandler } from "../../../shared/utils";
import { useOnboardingStore } from "../store/useOnboardingStore";

export function useNotificationActions() {
  const { setAllowNotifications } = useOnboardingStore();

  const handleNotificationPermission = async () => {
    try {
      // Request notification permissions
      const { status } = await import("expo-notifications").then((module) =>
        module.requestPermissionsAsync()
      );

      if (status === "granted") {
        setAllowNotifications(true);
        Alert.alert(
          "Notifications Enabled",
          "You'll receive helpful reminders for your activities.",
        );
      } else {
        setAllowNotifications(false);
        Alert.alert(
          "Notifications Disabled",
          "You can enable them later in settings if you change your mind.",
        );
      }
    } catch (error) {
      GlobalErrorHandler.logError(
        "Failed to request notification permissions",
        "NOTIFICATION_PERMISSION_ERROR",
        { error },
      );
      setAllowNotifications(false);
    }
  };

  return {
    handleNotificationPermission,
  };
}
