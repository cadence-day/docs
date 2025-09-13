import type { Activity } from "@/shared/types/models/activity";
import { useCallback } from "react";
import * as Haptics from "expo-haptics";
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
