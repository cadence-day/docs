import { useNotificationStore } from "@/shared/notifications/stores/notificationsStore";
import { userOnboardingStorage } from "@/shared/storage/user/onboarding";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import * as WebBrowser from "expo-web-browser";

export function useOnboardingActions() {
  const { requestPermissions, updatePreferences, updateTiming } = useNotificationStore();

  const handleNotificationPermission = async () => {
    try {
      const granted = await requestPermissions();
      if (granted) {
        // Set default preferences
        updatePreferences({
          morningReminders: true,
          eveningReminders: true,
          middayReflection: true,
          weeklyStreaks: true,
        });

        // Set default timing
        updateTiming({
          morningTime: "07:00",
          middayTime: "12:00",
          eveningTime: "20:00",
        });
      }
    } catch (error) {
      GlobalErrorHandler.logError(
        "Error setting up notifications in onboarding",
        "ONBOARDING_NOTIFICATION_ERROR",
        { error }
      );
    }
  };

  const handlePrivacyPolicy = async () => {
    await WebBrowser.openBrowserAsync("https://app.cadence.day/legal/privacy", {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
  };

  const handleComplete = async (confirm?: () => void, dialogId?: string) => {
    try {
      await userOnboardingStorage.setShown(true);
    } catch (error) {
      GlobalErrorHandler.logError(
        "Error saving onboarding completion",
        "ONBOARDING_STORAGE_ERROR",
        { error }
      );
    }

    confirm?.();

    try {
      const useDialogStore = require("@/shared/stores/useDialogStore").default;
      if (dialogId) {
        useDialogStore.getState().closeDialog(dialogId);
      }
    } catch {
      // Ignore dialog store errors
    }
  };

  return {
    handleNotificationPermission,
    handlePrivacyPolicy,
    handleComplete,
  };
}