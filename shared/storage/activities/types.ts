import type { Activity } from "@/shared/types/models";

/**
 * Activity order storage types
 */
export interface ActivityOrder {
  enabled: string[]; // Array of activity IDs in their desired order
  disabled: string[]; // Array of disabled activity IDs (for future re-enabling)
  lastUpdated: string; // ISO timestamp of last update
}

/**
 * Activity preferences storage types
 */
export interface ActivityPreferences {
  defaultGridColumns: number;
  showDisabledActivities: boolean;
  enableHapticFeedback: boolean;
  autoSaveOrder: boolean;
  dragSensitivity: number;
  lastUsedColors: string[]; // Recently used colors for quick access
}

/**
 * Activity usage statistics storage types
 */
export interface ActivityUsageStats {
  [activityId: string]: {
    totalUsage: number; // Total times used
    lastUsed: string; // ISO timestamp
    averageUsagePerWeek: number;
    monthlyUsage: { [monthKey: string]: number }; // YYYY-MM format
  };
}

/**
 * Helper types for activity operations
 */
export interface ActivityOrderUpdate {
  activities: Activity[];
  preserveDisabledOrder?: boolean;
}

export interface ActivityReorderOperation {
  fromIndex: number;
  toIndex: number;
  activityId: string;
}
