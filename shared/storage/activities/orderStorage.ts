import type { Activity } from "@/shared/types/models";
import { BaseStorage } from "../base";
import { STORAGE_KEYS } from "../types";
import type { ActivityOrder, ActivityReorderOperation } from "./types";

/**
 * Activity order storage manager
 * Handles persistent storage of activity ordering and related operations
 */
export class ActivityOrderStorage extends BaseStorage {
  constructor() {
    super("activity");
  }

  /**
   * Save activity order to storage
   * Stores both enabled and disabled activity orders with timestamp
   */
  async saveOrder(
    activities: Activity[],
    preserveDisabledOrder = true
  ): Promise<boolean> {
    const enabledIds = activities
      .filter((activity) => activity.status === "ENABLED" && activity.id)
      .map((activity) => activity.id as string);

    const disabledIds = activities
      .filter((activity) => activity.status === "DISABLED" && activity.id)
      .map((activity) => activity.id as string);

    const currentOrder = await this.getOrder();

    const orderData: ActivityOrder = {
      enabled: enabledIds,
      disabled:
        preserveDisabledOrder && currentOrder.data?.disabled
          ? [...new Set([...currentOrder.data.disabled, ...disabledIds])] // Merge and dedupe
          : disabledIds,
      lastUpdated: new Date().toISOString(),
    };

    const result = await this.set(STORAGE_KEYS.ACTIVITY_ORDER, orderData);
    return result.success;
  }

  /**
   * Load activity order from storage
   */
  async getOrder(): Promise<{
    success: boolean;
    data?: ActivityOrder;
    error?: string;
  }> {
    const defaultOrder: ActivityOrder = {
      enabled: [],
      disabled: [],
      lastUpdated: new Date().toISOString(),
    };

    return await this.get(STORAGE_KEYS.ACTIVITY_ORDER, defaultOrder);
  }

  /**
   * Sort activities array according to stored order
   */
  sortActivitiesByStoredOrder(
    activities: Activity[],
    storedOrder?: ActivityOrder
  ): Activity[] {
    if (!storedOrder || storedOrder.enabled.length === 0) {
      return activities; // Return original order if no stored order
    }

    const enabledActivities = activities.filter((a) => a.status === "ENABLED");
    const disabledActivities = activities.filter(
      (a) => a.status === "DISABLED"
    );
    const otherActivities = activities.filter(
      (a) => a.status !== "ENABLED" && a.status !== "DISABLED"
    );

    // Sort enabled activities by stored order
    const sortedEnabled: Activity[] = [];
    const remainingEnabled: Activity[] = [];

    storedOrder.enabled.forEach((activityId) => {
      const activity = enabledActivities.find((a) => a.id === activityId);
      if (activity) {
        sortedEnabled.push(activity);
      }
    });

    enabledActivities.forEach((activity) => {
      if (activity.id && !storedOrder.enabled.includes(activity.id)) {
        remainingEnabled.push(activity);
      }
    });

    // Sort disabled activities by stored order if available
    const sortedDisabled: Activity[] = [];
    const remainingDisabled: Activity[] = [];

    if (storedOrder.disabled && storedOrder.disabled.length > 0) {
      storedOrder.disabled.forEach((activityId) => {
        const activity = disabledActivities.find((a) => a.id === activityId);
        if (activity) {
          sortedDisabled.push(activity);
        }
      });

      disabledActivities.forEach((activity) => {
        if (activity.id && !storedOrder.disabled.includes(activity.id)) {
          remainingDisabled.push(activity);
        }
      });
    } else {
      remainingDisabled.push(...disabledActivities);
    }

    return [
      ...sortedEnabled,
      ...remainingEnabled,
      ...sortedDisabled,
      ...remainingDisabled,
      ...otherActivities,
    ];
  }

  /**
   * Update order for a single reorder operation
   */
  async reorderActivity(
    currentActivities: Activity[],
    operation: ActivityReorderOperation
  ): Promise<{ success: boolean; reorderedActivities?: Activity[] }> {
    const enabledActivities = currentActivities.filter(
      (a) => a.status === "ENABLED"
    );

    if (
      operation.fromIndex < 0 ||
      operation.fromIndex >= enabledActivities.length ||
      operation.toIndex < 0 ||
      operation.toIndex >= enabledActivities.length
    ) {
      return { success: false };
    }

    const reorderedEnabled = [...enabledActivities];
    const [draggedItem] = reorderedEnabled.splice(operation.fromIndex, 1);
    reorderedEnabled.splice(operation.toIndex, 0, draggedItem);

    // Combine with non-enabled activities
    const otherActivities = currentActivities.filter(
      (a) => a.status !== "ENABLED"
    );
    const allReorderedActivities = [...reorderedEnabled, ...otherActivities];

    const saved = await this.saveOrder(allReorderedActivities);

    return {
      success: saved,
      reorderedActivities: saved ? allReorderedActivities : undefined,
    };
  }

  /**
   * Handle activity status change (enable/disable) with order preservation
   */
  async updateActivityStatus(
    activities: Activity[],
    activityId: string,
    newStatus: "ENABLED" | "DISABLED"
  ): Promise<{ success: boolean; updatedActivities?: Activity[] }> {
    const updatedActivities = activities.map((activity) =>
      activity.id === activityId ? { ...activity, status: newStatus } : activity
    );

    const saved = await this.saveOrder(updatedActivities, true);

    return {
      success: saved,
      updatedActivities: saved ? updatedActivities : undefined,
    };
  }

  /**
   * Remove an activity from stored order (for deleted activities)
   */
  async removeFromOrder(activityId: string): Promise<boolean> {
    const currentOrder = await this.getOrder();

    if (!currentOrder.success || !currentOrder.data) {
      return false;
    }

    const updatedOrder: ActivityOrder = {
      ...currentOrder.data,
      enabled: currentOrder.data.enabled.filter((id) => id !== activityId),
      disabled: currentOrder.data.disabled.filter((id) => id !== activityId),
      lastUpdated: new Date().toISOString(),
    };

    const result = await this.set(STORAGE_KEYS.ACTIVITY_ORDER, updatedOrder);
    return result.success;
  }

  /**
   * Clear all stored order data
   */
  async clearOrder(): Promise<boolean> {
    const result = await this.remove(STORAGE_KEYS.ACTIVITY_ORDER);
    return result.success;
  }

  /**
   * Get order statistics for debugging/analytics
   */
  async getOrderStats(): Promise<{
    totalEnabled: number;
    totalDisabled: number;
    lastUpdated?: string;
  }> {
    const order = await this.getOrder();

    if (!order.success || !order.data) {
      return { totalEnabled: 0, totalDisabled: 0 };
    }

    return {
      totalEnabled: order.data.enabled.length,
      totalDisabled: order.data.disabled.length,
      lastUpdated: order.data.lastUpdated,
    };
  }
}

// Export singleton instance
export const activityOrderStorage = new ActivityOrderStorage();
