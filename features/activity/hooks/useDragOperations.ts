import { useState, useCallback, useEffect } from 'react';
import type { Activity } from '@/shared/types/models/activity';
import * as Haptics from 'expo-haptics';

interface UseDragOperationsProps {
  activities: Activity[];
  onOrderChange?: (newOrder: Activity[]) => void;
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
  const [draggedActivityId, setDraggedActivityId] = useState<string | null>(null);
  const [dragPlaceholderIndex, setDragPlaceholderIndex] = useState<number | null>(null);
  const [isShakeMode, setIsShakeMode] = useState(false);

  // Update activity order when activities prop changes
  useEffect(() => {
    setActivityOrder(activities);
  }, [activities]);

  const handleDragStart = useCallback((activityId: string) => {
    setDraggedActivityId(activityId);
    onDragStateChange?.(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [onDragStateChange]);

  const handleDragEnd = useCallback(() => {
    setDraggedActivityId(null);
    setDragPlaceholderIndex(null);
    onDragStateChange?.(false);
  }, [onDragStateChange]);

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    setActivityOrder(currentOrder => {
      const newOrder = [...currentOrder];
      const [draggedItem] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, draggedItem);
      
      // Trigger haptic feedback for successful reorder
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Call the external handler
      onOrderChange?.(newOrder);
      
      return newOrder;
    });
  }, [onOrderChange]);

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