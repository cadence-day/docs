import { useNotificationStore } from "@/shared/notifications/stores/notificationsStore";
import { userOnboardingStorage } from "@/shared/storage/user/onboarding";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { useOnboardingStore } from "../store/useOnboardingStore";
import { useOnboardingCompletion } from "./useOnboardingCompletion";

export function useOnboardingActions() {
  const { requestPermissions, updatePreferences, updateTiming } =
    useNotificationStore();
  const { completeOnboarding } = useOnboardingCompletion();
  const { getOnboardingData, setAllowNotifications } = useOnboardingStore();

  // For compatibility with existing code that expects state variables
  const onboardingData = getOnboardingData();
  const selectedActivities = onboardingData.selectedActivities;
  const allowNotifications = onboardingData.allowNotifications;

  const handleNotificationPermission = async () => {
    setAllowNotifications(true);
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
        { error },
      );
    }
  };

  const handleComplete = async (confirm?: () => void, dialogId?: string) => {
    try {
      await userOnboardingStorage.setShown(true);

      // Get the latest data from the store
      const currentData = getOnboardingData();

      // Complete full onboarding flow with all collected data
      await completeOnboarding(
        {
          selectedActivities: currentData.selectedActivities,
          allowNotifications: currentData.allowNotifications,
        },
        confirm,
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        "Error completing onboarding",
        "ONBOARDING_COMPLETION_ERROR",
        { error },
      );
      confirm?.(); // Still call confirm even if there's an error
    }

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
    handleComplete,
    selectedActivities,
    allowNotifications,
  };
}
