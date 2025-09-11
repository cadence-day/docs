import { activityOrderStorage } from "@/shared/storage/activities";
import type { Activity } from "@/shared/types/models";

/**
 * @deprecated Use activityOrderStorage from @/shared/storage/activities instead
 * This file is kept for backward compatibility
 */

/**
 * Save activity order to local storage
 * @deprecated Use activityOrderStorage.saveOrder() instead
 */
export const saveActivityOrderToStorage = async (
  activities: Activity[]
): Promise<void> => {
  const success = await activityOrderStorage.saveOrder(activities);
  if (!success) {
    throw new Error("Failed to save activity order");
  }
};

/**
 * Load activity order from local storage
 * @deprecated Use activityOrderStorage.getOrder() instead
 */
export const loadActivityOrderFromStorage = async (): Promise<string[]> => {
  const result = await activityOrderStorage.getOrder();
  return result.data?.enabled || [];
};

/**
 * Sort activities array according to saved order
 * @deprecated Use activityOrderStorage.sortActivitiesByStoredOrder() instead
 */
export const sortActivitiesByStoredOrder = (
  activities: Activity[],
  storedOrder: string[]
): Activity[] => {
  const orderData = {
    enabled: storedOrder,
    disabled: [],
    lastUpdated: new Date().toISOString(),
  };
  return activityOrderStorage.sortActivitiesByStoredOrder(
    activities,
    orderData
  );
};

/**
 * Clear activity order from local storage
 * @deprecated Use activityOrderStorage.clearOrder() instead
 */
export const clearActivityOrderFromStorage = async (): Promise<void> => {
  const success = await activityOrderStorage.clearOrder();
  if (!success) {
    throw new Error("Failed to clear activity order");
  }
};
