import { userOnboardingStorage } from "@/shared/storage/user/onboarding";
import { Logger } from "@/shared/utils/errorHandler";
import { useOnboardingStore } from "../store/useOnboardingStore";
import { useOnboardingCompletion } from "./useOnboardingCompletion";

export function useOnboardingActions() {
  const { completeOnboarding } = useOnboardingCompletion();
  const store = useOnboardingStore();

  const handleComplete = async (confirm?: () => void) => {
    try {
      await userOnboardingStorage.setShown(true);

      // Get the latest data from the store
      const currentData = store.getOnboardingData();

      // Complete full onboarding flow with all collected data
      await completeOnboarding(
        {
          selectedActivities: currentData.selectedActivities,
          allowNotifications: currentData.allowNotifications,
        },
        confirm,
      );
    } catch (error) {
      Logger.logError(
        "Error completing onboarding",
        "ONBOARDING_COMPLETION_ERROR",
        { error },
      );
      confirm?.(); // Still call confirm even if there's an error
    }
  };

  return {
    handleComplete,
    // Provide reactive access to store state
    selectedActivities: store.selectedActivities,
    allowNotifications: store.allowNotifications,
  };
}
