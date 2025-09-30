import useTranslation from "@/shared/hooks/useI18n";
import { notificationEngine } from "@/shared/notifications/NotificationEngine";
import {
  useActivitiesStore,
  useActivityCategoriesStore,
} from "@/shared/stores";
import useNotificationSettingsStore from "@/shared/stores/resources/useNotificationsStore";
import type { Activity } from "@/shared/types/models/activity";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { useUser } from "@clerk/clerk-expo";
import * as Notifications from "expo-notifications";
import { useState } from "react";
import { Alert } from "react-native";
import {
  ACTIVITY_PRESETS,
  convertPresetToActivity,
} from "../data/activityPresets";
import { useOnboardingStore } from "../store/useOnboardingStore";

interface OnboardingCompletionData {
  selectedActivities: string[];
  allowNotifications: boolean;
}

export function useOnboardingCompletion() {
  const { t } = useTranslation();
  const { user } = useUser();
  const insertActivities = useActivitiesStore((state) =>
    state.insertActivities
  );
  const { categories, getAllCategories } = useActivityCategoriesStore();
  const { resetStore } = useOnboardingStore();
  const [isProcessing, setIsProcessing] = useState(false);

  // Use the new notification store
  const {
    upsertNotificationSettings,
    initializeForCurrentUser,
  } = useNotificationSettingsStore();

  const requestNotificationPermissions = async (): Promise<boolean> => {
    try {
      GlobalErrorHandler.logDebug(
        "Requesting notification permissions during onboarding",
        "onboarding:requestNotificationPermissions",
      );
      const { status: existingStatus } = await Notifications
        .getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        GlobalErrorHandler.logDebug(
          "Requesting notification permissions from user",
          "onboarding:requestNotificationPermissions",
        );
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus === "granted") {
        GlobalErrorHandler.logDebug(
          "Notification permissions granted, setting default preferences",
          "onboarding:requestNotificationPermissions",
        );

        try {
          // Initialize notification settings for the current user (creates defaults if none exist)
          await initializeForCurrentUser();

          // Get push token
          const pushToken = await Notifications.getExpoPushTokenAsync();

          // Update with onboarding-specific preferences
          await upsertNotificationSettings({
            user_id: user?.id || null,
            push_enabled: true,
            email_enabled: false,
            notification_type: [
              "morning-reminders",
              "evening-reminders",
              "midday-checkins",
            ],
            wake_up_time: "08:00:00",
            sleep_time: "19:00:00",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            expo_push_token: pushToken.data,
            hours_of_reminders: ["08:00", "12:00", "19:00"],
          });

          // Initialize and schedule notifications
          await notificationEngine.initialize();
          await notificationEngine.scheduleAllNotifications();
        } catch (error) {
          GlobalErrorHandler.logError(
            error,
            "onboarding:requestNotificationPermissions:setup",
          );
          // Don't fail onboarding if notification setup fails
        }

        return true;
      }

      GlobalErrorHandler.logDebug(
        "Notification permissions denied or error occurred",
        "onboarding:requestNotificationPermissions",
      );
      return false;
    } catch (error) {
      GlobalErrorHandler.logDebug(
        "Error requesting notification permissions",
        "onboarding:requestNotificationPermissions",
        { error },
      );
      return false;
    }
  };

  const createActivities = async (
    selectedActivityIds: string[],
    userId: string,
  ): Promise<Activity[]> => {
    try {
      GlobalErrorHandler.logDebug(
        "Creating onboarding activities",
        "onboarding:createActivities",
        { selectedActivityIds, userId },
      );
      // First, ensure we have activity categories loaded
      await getAllCategories();

      const selectedPresets = ACTIVITY_PRESETS.filter((preset) =>
        selectedActivityIds.includes(preset.id)
      );

      // Print all loaded categories for debugging
      GlobalErrorHandler.logDebug(
        "Loaded activity categories before mapping presets",
        "onboarding:createActivities",
        { categories },
      );

      // Map category keys to actual category IDs
      const activityData: Omit<Activity, "id" | "created_at" | "updated_at">[] =
        selectedPresets.map(
          (preset) => {
            // Find the category by its key
            const category = categories.find((cat) =>
              cat.key === preset.categoryKey
            );
            if (!category || !category.id) {
              GlobalErrorHandler.logDebug(
                "Category not found for activity preset",
                "onboarding:createActivities",
                { preset },
              );
              throw new Error(
                `Category not found or invalid for key: ${preset.categoryKey}`,
              );
            }

            // Get localized name for the activity
            const localizedName = t(preset.nameKey);

            return convertPresetToActivity(
              preset,
              userId,
              localizedName,
              category.id,
            );
          },
        );

      // Use the activities store to create all activities at once
      const createdActivities = await insertActivities(activityData);
      GlobalErrorHandler.logDebug(
        "Onboarding activities created successfully",
        "onboarding:createActivities",
        { createdActivities },
      );
      return createdActivities;
    } catch (error) {
      GlobalErrorHandler.logDebug(
        "Error creating onboarding activities",
        "onboarding:createActivities",
        { error },
      );
      throw new Error(
        `Failed to create activities: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  };

  const completeOnboarding = async (
    data: OnboardingCompletionData,
    onComplete?: () => void,
  ): Promise<void> => {
    if (isProcessing) return;

    setIsProcessing(true);

    GlobalErrorHandler.logDebug(
      "Starting onboarding completion workflow",
      "onboarding:completeOnboarding",
      { data },
    );

    try {
      let notificationsEnabled = false;

      // Step 1: Handle notification permissions
      if (data.allowNotifications) {
        GlobalErrorHandler.logDebug(
          "User opted in for notifications during onboarding",
          "onboarding:completeOnboarding",
        );
        notificationsEnabled = await requestNotificationPermissions();
        if (!notificationsEnabled) {
          GlobalErrorHandler.logDebug(
            "Notification permissions not enabled",
            "onboarding:completeOnboarding",
          );
          Alert.alert(
            t("common.error"),
            "Failed to enable notifications. You can enable them later in settings.",
          );
        }
      }

      // Step 2: Create selected activities (only if activities are selected)
      if (data.selectedActivities.length > 0 && user?.id) {
        GlobalErrorHandler.logDebug(
          "Creating activities as part of onboarding",
          "onboarding:completeOnboarding",
          { selectedActivities: data.selectedActivities, userId: user.id },
        );
        await createActivities(data.selectedActivities, user.id);
      } else {
        GlobalErrorHandler.logDebug(
          "No activities selected or no user ID - skipping activity creation",
          "onboarding:completeOnboarding",
        );
      }

      // Step 3: Mark onboarding as complete - flush onboarding store
      GlobalErrorHandler.logDebug(
        "Onboarding completed successfully - flushing onboarding store",
        "onboarding:completeOnboarding",
      );
      resetStore();

      // Step 4: Call completion callback
      onComplete?.();
    } catch (error) {
      GlobalErrorHandler.logDebug(
        "Error during onboarding completion",
        "onboarding:completeOnboarding",
        { error },
      );
      Alert.alert(
        t("common.error"),
        "Failed to complete onboarding. Please try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const pushOnboarding = async (): Promise<void> => {
    // This function pushes onboarding data to backend/storage
    // Implementation can be added here if needed
    GlobalErrorHandler.logDebug(
      "Pushing onboarding data to backend",
      "onboarding:pushOnboarding",
    );
  };

  return {
    completeOnboarding,
    isProcessing,
    requestNotificationPermissions,
    createActivities,
    pushOnboarding,
  };
}
