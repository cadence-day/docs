import { BaseStorage } from "../base";
import { STORAGE_KEYS } from "../types";
import type { ActivityPreferences } from "./types";

/**
 * Activity preferences storage manager
 * Handles user preferences for activity management
 */
export class ActivityPreferencesStorage extends BaseStorage {
  constructor() {
    super("activity");
  }

  /**
   * Get activity preferences with defaults
   */
  async getPreferences(): Promise<{
    success: boolean;
    data?: ActivityPreferences;
    error?: string;
  }> {
    const defaultPreferences: ActivityPreferences = {
      defaultGridColumns: 4,
      showDisabledActivities: true,
      enableHapticFeedback: true,
      autoSaveOrder: true,
      dragSensitivity: 0.4,
      lastUsedColors: [],
    };

    return await this.get(
      STORAGE_KEYS.ACTIVITY_PREFERENCES,
      defaultPreferences
    );
  }

  /**
   * Update specific preference
   */
  async updatePreference<K extends keyof ActivityPreferences>(
    key: K,
    value: ActivityPreferences[K]
  ): Promise<boolean> {
    const current = await this.getPreferences();

    if (!current.success || !current.data) {
      return false;
    }

    const updated: ActivityPreferences = {
      ...current.data,
      [key]: value,
    };

    const result = await this.set(STORAGE_KEYS.ACTIVITY_PREFERENCES, updated);
    return result.success;
  }

  /**
   * Update multiple preferences at once
   */
  async updatePreferences(
    updates: Partial<ActivityPreferences>
  ): Promise<boolean> {
    const current = await this.getPreferences();

    if (!current.success || !current.data) {
      return false;
    }

    const updated: ActivityPreferences = {
      ...current.data,
      ...updates,
    };

    const result = await this.set(STORAGE_KEYS.ACTIVITY_PREFERENCES, updated);
    return result.success;
  }

  /**
   * Add color to recently used colors (with deduplication and limit)
   */
  async addRecentColor(color: string, maxColors = 10): Promise<boolean> {
    const current = await this.getPreferences();

    if (!current.success || !current.data) {
      return false;
    }

    const currentColors = current.data.lastUsedColors || [];
    const updatedColors = [
      color,
      ...currentColors.filter((c) => c !== color),
    ].slice(0, maxColors);

    return await this.updatePreference("lastUsedColors", updatedColors);
  }

  /**
   * Clear all preferences (reset to defaults)
   */
  async clearPreferences(): Promise<boolean> {
    const result = await this.remove(STORAGE_KEYS.ACTIVITY_PREFERENCES);
    return result.success;
  }
}

// Export singleton instance
export const activityPreferencesStorage = new ActivityPreferencesStorage();
