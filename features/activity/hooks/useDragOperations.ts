import type { Activity } from "@/shared/types/models/activity";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import { Logger } from "../../../shared/utils/errorHandler";

interface UseDragOperationsProps {
  activities: Activity[];
  onOrderChange?: (newOrder: Activity[]) => Promise<void>;
  onDragStateChange?: (isDragging: boolean) => void;
}

interface UseDragOperationsReturn {
  activityOrder: Activity[];
  draggedActivityId: string | null;
  dragPlaceholderIndex: number | null;
  isShakeMode: boolean;
  handleDragStart: (activityId: string) => void;
  handleDragEnd: () => void;
  handleReorder: (fromIndex: number, toIndex: number) => void;
  handlePlaceholderChange: (index: number | null) => void;
  setIsShakeMode: (enabled: boolean) => void;
}

export const useDragOperations = ({
  activities,
  onOrderChange,
  onDragStateChange,
}: UseDragOperationsProps): UseDragOperationsReturn => {
  const [activityOrder, setActivityOrder] = useState<Activity[]>(activities);
  const [draggedActivityId, setDraggedActivityId] = useState<string | null>(
    null,
  );
  const [dragPlaceholderIndex, setDragPlaceholderIndex] = useState<
    number | null
  >(null);
  const [isShakeMode, setIsShakeMode] = useState(false);

  // Update local order when activities prop changes (only if not dragging)
  useEffect(() => {
    if (!draggedActivityId) {
      setActivityOrder(activities);
    }
  }, [activities, draggedActivityId]);

  const handleDragStart = useCallback(
    (activityId: string) => {
      setDraggedActivityId(activityId);
      setIsShakeMode(true);
      onDragStateChange?.(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
    [onDragStateChange],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedActivityId(null);
    setDragPlaceholderIndex(null);
    setIsShakeMode(false);
    onDragStateChange?.(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [onDragStateChange]);

  const handleReorder = useCallback(
    async (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
        return;
      }

      try {
        // Create new order optimistically
        const newOrder = [...activityOrder];
        const [draggedItem] = newOrder.splice(fromIndex, 1);
        newOrder.splice(toIndex, 0, draggedItem);

        // Update local state immediately
        setActivityOrder(newOrder);

        // Trigger haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Persist the change
        if (onOrderChange) {
          await onOrderChange(newOrder);
        }
      } catch (error) {
        Logger.logError(
          "Failed to reorder activities",
          "REORDER_ACTIVITIES_ERROR",
          { error },
        );
        // Revert on error
        setActivityOrder(activities);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    },
    [activityOrder, onOrderChange, activities],
  );

  const handlePlaceholderChange = useCallback((index: number | null) => {
    setDragPlaceholderIndex(index);
  }, []);

  return {
    activityOrder,
    draggedActivityId,
    dragPlaceholderIndex,
    isShakeMode,
    handleDragStart,
    handleDragEnd,
    handleReorder,
    handlePlaceholderChange,
    setIsShakeMode,
  };
};
