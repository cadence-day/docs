import { useActivitiesStore } from "@/shared/stores";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import type { Activity } from "@/shared/types/models/activity";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import type { GridConfig } from "../components/utils/gridUtils";
import { useDragOperations } from "./useDragOperations";
import { useGridCalculations } from "./useGridCalculations";

interface UseActivityManagementProps {
  gridConfig?: Partial<GridConfig>;
  includeAddButton?: boolean;
  onDragStateChange?: (isDragging: boolean) => void;
}

interface UseActivityManagementReturn {
  // Grid calculations
  gridProperties: ReturnType<typeof useGridCalculations>["gridProperties"];
  effectiveGridConfig: ReturnType<
    typeof useGridCalculations
  >["effectiveGridConfig"];
  enabledActivities: Activity[];
  disabledActivities: Activity[];
  totalItemsForGrid: number;

  // Drag operations
  activityOrder: Activity[];
  draggedActivityId: string | null;
  dragPlaceholderIndex: number | null;
  isShakeMode: boolean;
  handleDragStart: (activityId: string) => void;
  handleDragEnd: () => void;
  handleReorder: (fromIndex: number, toIndex: number) => void;
  handlePlaceholderChange: (index: number | null) => void;
  setIsShakeMode: (enabled: boolean) => void;

  // Activity management operations
  handleDisableActivity: (activityId: string) => Promise<void>;
  handleEnableActivity: (activity: Activity) => Promise<void>;
  handleSoftDeleteActivity: (activityId: string) => Promise<void>;
  isSavingOrder: boolean;
  isLoading: boolean;
}

/**
 * Combined hook for activity management that provides both grid calculations
 * and drag operations with persistent storage.
 *
 * This hook uses store activities directly to avoid prop conflicts.
 */
export const useActivityManagement = ({
  gridConfig,
  includeAddButton = true,
  onDragStateChange,
}: UseActivityManagementProps): UseActivityManagementReturn => {
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // Get activities directly from store (single source of truth)
  const storeActivities = useActivitiesStore((state) => state.activities);
  const storeDisabledActivities = useActivitiesStore(
    (state) => state.disabledActivities
  );
  const isLoading = useActivitiesStore((state) => state.isLoading);

  // Store functions
  const updateActivityOrder = useActivitiesStore(
    (state) => state.updateActivityOrder
  );
  const disableActivity = useActivitiesStore((state) => state.disableActivity);
  const enableActivity = useActivitiesStore((state) => state.enableActivity);
  const loadStoredOrder = useActivitiesStore((state) => state.loadStoredOrder);

  // Load stored order on mount
  useEffect(() => {
    loadStoredOrder();
  }, [loadStoredOrder]);

  // Combine all activities for grid calculations
  const allActivities = [...storeActivities, ...storeDisabledActivities];

  // Grid calculations using store activities
  const gridCalculations = useGridCalculations({
    activities: allActivities,
    gridConfig,
    includeAddButton,
  });

  // Handle order changes with storage persistence
  const handleOrderChange = useCallback(
    async (newOrder: Activity[]) => {
      setIsSavingOrder(true);
      try {
        // Combine enabled activities with disabled ones to maintain full order
        const allActivities = [...newOrder, ...storeDisabledActivities];
        await updateActivityOrder(allActivities);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error("Error saving activity order:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setIsSavingOrder(false);
      }
    },
    [storeDisabledActivities, updateActivityOrder]
  );

  // Drag operations using store activities
  const dragOperations = useDragOperations({
    activities: storeActivities, // Use store activities directly
    onOrderChange: handleOrderChange,
    onDragStateChange,
  });

  // Activity management operations
  const handleDisableActivity = useCallback(
    async (activityId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      try {
        await disableActivity(activityId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        GlobalErrorHandler.logError(error, "DISABLE_ACTIVITY", { activityId });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    },
    [disableActivity]
  );

  const handleEnableActivity = useCallback(
    async (activity: Activity) => {
      try {
        if (activity.id) {
          await enableActivity(activity.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (error) {
        GlobalErrorHandler.logError(error, "ENABLE_ACTIVITY", { activityId: activity.id });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    },
    [enableActivity]
  );

  return {
    // Grid calculations
    ...gridCalculations,

    // Drag operations
    ...dragOperations,

    // Activity management
    handleDisableActivity,
    handleEnableActivity,
    handleSoftDeleteActivity: async (_: string) => {},
    isSavingOrder,
    isLoading,
  };
};
