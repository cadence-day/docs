/**
 * Common types for AsyncStorage operations
 */

export interface StorageOperation<T> {
  key: string;
  data?: T;
}

export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type StorageKeys = {
  // Activity-related storage
  ACTIVITY_ORDER: "activity_order";
  ACTIVITY_PREFERENCES: "activity_preferences";
  ACTIVITY_USAGE_STATS: "activity_usage_stats";

  // UI-related storage
  UI_THEME: "ui_theme";
  UI_GRID_CONFIG: "ui_grid_config";
  UI_LAYOUT_PREFERENCES: "ui_layout_preferences";

  // User-related storage
  USER_PROFILE: "user_profile";
  USER_SETTINGS: "user_settings";
  USER_ONBOARDING: "user_onboarding";
  USER_LAST_SEEN_VERSION: "user_last_seen_version";
};

export const STORAGE_KEYS: StorageKeys = {
  // Activity-related storage
  ACTIVITY_ORDER: "activity_order",
  ACTIVITY_PREFERENCES: "activity_preferences",
  ACTIVITY_USAGE_STATS: "activity_usage_stats",

  // UI-related storage
  UI_THEME: "ui_theme",
  UI_GRID_CONFIG: "ui_grid_config",
  UI_LAYOUT_PREFERENCES: "ui_layout_preferences",

  // User-related storage
  USER_PROFILE: "user_profile",
  USER_SETTINGS: "user_settings",
  USER_ONBOARDING: "user_onboarding",
  USER_LAST_SEEN_VERSION: "user_last_seen_version",
} as const;
