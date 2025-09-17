import { useSelectionStore } from "@/shared/stores";
import type { Activity } from "@/shared/types/models/activity";
import * as Haptics from "expo-haptics";
import { useCallback } from "react";
import { useActivitiesData } from "./useActivitiesData";

interface UseActivitiesActionsProps {
  onActivityPress?: (activity: Activity) => void;
  onActivityLongPress?: (activity: Activity) => void;
  onEditActivity?: (activity: Activity) => void;
}

interface UseActivitiesActionsReturn {
  handleActivityPress: (activity: Activity) => void;
  handleActivityLongPress: (activity: Activity) => void;
  refresh: () => Promise<void>;
}

export const useActivitiesActions = ({
  onActivityPress,
  onActivityLongPress,
  onEditActivity,
}: UseActivitiesActionsProps): UseActivitiesActionsReturn => {
  const { refresh: refreshData } = useActivitiesData();

  const handleActivityPress = useCallback(
    (activity: Activity) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Set selected activity in selection store so other parts of the app
      // (e.g. timeslice assignment) can read the current activity selection.
      try {
        useSelectionStore.getState().setSelectedActivityId(activity.id ?? null);
      } catch (e) {
        // If store not available for some reason, ignore silently
      }

      onActivityPress?.(activity);
    },
    [onActivityPress]
  );

  const handleActivityLongPress = useCallback(
    (activity: Activity) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onActivityLongPress?.(activity);
      onEditActivity?.(activity);
    },
    [onActivityLongPress, onEditActivity]
  );

  const refresh = useCallback(async () => {
    await refreshData();
  }, [refreshData]);

  return {
    handleActivityPress,
    handleActivityLongPress,
    refresh,
  };
};
