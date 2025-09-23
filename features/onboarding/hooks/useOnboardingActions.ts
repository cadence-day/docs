import { useNotifications } from "@/shared/notifications";
import { userOnboardingStorage } from "@/shared/storage/user/onboarding";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import * as WebBrowser from "expo-web-browser";
import type { NotificationPreferences } from "@/shared/notifications/types";

export function useOnboardingActions() {
  const { requestPermissions, updatePreferences } = useNotifications();

  const handleNotificationPermission = async () => {
    try {
      const result = await requestPermissions();
      if (result.granted) {
        const defaultPreferences: NotificationPreferences = {
          rhythm: "both",
          middayTime: "12:00",
          eveningTimeStart: "20:00",
          eveningTimeEnd: "21:00",
          streaksEnabled: true,
          lightTouch: true,
        };
        await updatePreferences(defaultPreferences);
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