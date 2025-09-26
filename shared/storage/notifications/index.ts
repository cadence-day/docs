import type {
    NotificationPreferences,
    NotificationTiming,
} from "@/shared/stores/resources/useNotificationsStore";
import { BaseStorage } from "../base";
import type { StorageResult } from "../types";

export interface NotificationScheduleStatus {
    lastScheduled: string | null;
    isScheduled: boolean;
    pendingCount: number;
}

export interface NotificationStorageData {
    timing: NotificationTiming;
    preferences: NotificationPreferences;
    scheduleStatus: NotificationScheduleStatus;
}

/**
 * Storage service for notification settings and state
 */
class NotificationStorage extends BaseStorage {
    constructor() {
        super("notification");
    }

    /**
     * Get notification timing settings
     */
    async getTiming(): Promise<StorageResult<NotificationTiming>> {
        return this.get<NotificationTiming>("timing", {
            morningTime: "08:00",
            middayTime: "12:00",
            eveningTime: "18:00",
        });
    }

    /**
     * Save notification timing settings
     */
    async setTiming(
        timing: NotificationTiming,
    ): Promise<StorageResult<NotificationTiming>> {
        return this.set<NotificationTiming>("timing", timing);
    }

    /**
     * Update specific timing field
     */
    async updateTimingField(
        key: keyof NotificationTiming,
        value: string,
    ): Promise<StorageResult<NotificationTiming>> {
        const result = await this.getTiming();
        if (!result.success || !result.data) {
            return result;
        }

        const updatedTiming: NotificationTiming = {
            morningTime: result.data.morningTime,
            middayTime: result.data.middayTime,
            eveningTime: result.data.eveningTime,
            [key]: value,
        };
        return this.setTiming(updatedTiming);
    }

    /**
     * Remove specific timing field (reset to default)
     */
    async removeTimingField(
        key: keyof NotificationTiming,
    ): Promise<StorageResult<NotificationTiming>> {
        const defaults: NotificationTiming = {
            morningTime: "08:00",
            middayTime: "12:00",
            eveningTime: "18:00",
        };

        const result = await this.getTiming();
        if (!result.success || !result.data) {
            return result;
        }

        const updatedTiming: NotificationTiming = {
            morningTime: result.data.morningTime,
            middayTime: result.data.middayTime,
            eveningTime: result.data.eveningTime,
            [key]: defaults[key],
        };
        return this.setTiming(updatedTiming);
    }

    /**
     * Get notification preferences
     */
    async getPreferences(): Promise<StorageResult<NotificationPreferences>> {
        return this.get<NotificationPreferences>("preferences", {
            morningReminders: true,
            eveningReminders: false,
            weeklyStreaks: true,
            middayReflection: true,
        });
    }

    /**
     * Save notification preferences
     */
    async setPreferences(
        preferences: NotificationPreferences,
    ): Promise<StorageResult<NotificationPreferences>> {
        return this.set<NotificationPreferences>("preferences", preferences);
    }

    /**
     * Update specific preference field
     */
    async updatePreferenceField(
        key: keyof NotificationPreferences,
        value: boolean,
    ): Promise<StorageResult<NotificationPreferences>> {
        const result = await this.getPreferences();
        if (!result.success || !result.data) {
            return result;
        }

        const updatedPreferences: NotificationPreferences = {
            morningReminders: result.data.morningReminders,
            eveningReminders: result.data.eveningReminders,
            middayReflection: result.data.middayReflection,
            weeklyStreaks: result.data.weeklyStreaks,
            [key]: value,
        };
        return this.setPreferences(updatedPreferences);
    }

    /**
     * Remove specific preference field (reset to default)
     */
    async removePreferenceField(
        key: keyof NotificationPreferences,
    ): Promise<StorageResult<NotificationPreferences>> {
        const defaults: NotificationPreferences = {
            morningReminders: true,
            eveningReminders: false,
            weeklyStreaks: true,
            middayReflection: true,
        };

        const result = await this.getPreferences();
        if (!result.success || !result.data) {
            return result;
        }

        const updatedPreferences: NotificationPreferences = {
            morningReminders: result.data.morningReminders,
            eveningReminders: result.data.eveningReminders,
            middayReflection: result.data.middayReflection,
            weeklyStreaks: result.data.weeklyStreaks,
            [key]: defaults[key],
        };
        return this.setPreferences(updatedPreferences);
    }

    /**
     * Get notification schedule status
     */
    async getScheduleStatus(): Promise<
        StorageResult<NotificationScheduleStatus>
    > {
        return this.get<NotificationScheduleStatus>("scheduleStatus", {
            lastScheduled: null,
            isScheduled: false,
            pendingCount: 0,
        });
    }

    /**
     * Save notification schedule status
     */
    async setScheduleStatus(
        status: NotificationScheduleStatus,
    ): Promise<StorageResult<NotificationScheduleStatus>> {
        return this.set<NotificationScheduleStatus>("scheduleStatus", status);
    }

    /**
     * Get user's used quote IDs
     */
    async getUsedQuoteIds(): Promise<StorageResult<string[]>> {
        return this.get<string[]>("usedQuoteIds", []);
    }

    /**
     * Save user's used quote IDs
     */
    async setUsedQuoteIds(
        usedQuoteIds: string[],
    ): Promise<StorageResult<string[]>> {
        return this.set<string[]>("usedQuoteIds", usedQuoteIds);
    }

    /**
     * Add quote ID to used list
     */
    async addUsedQuoteId(quoteId: string): Promise<StorageResult<string[]>> {
        const result = await this.getUsedQuoteIds();
        if (!result.success) {
            return result;
        }

        const updatedIds = [...(result.data || []), quoteId];
        return this.setUsedQuoteIds(updatedIds);
    }

    /**
     * Reset used quote IDs
     */
    async resetUsedQuoteIds(): Promise<StorageResult<string[]>> {
        return this.setUsedQuoteIds([]);
    }

    /**
     * Get next quote index
     */
    async getNextQuoteIndex(): Promise<StorageResult<number>> {
        return this.get<number>("nextQuoteIndex", 0);
    }

    /**
     * Save next quote index
     */
    async setNextQuoteIndex(index: number): Promise<StorageResult<number>> {
        return this.set<number>("nextQuoteIndex", index);
    }

    /**
     * Get all notification data
     */
    async getAllData(): Promise<StorageResult<NotificationStorageData>> {
        try {
            const [timingResult, preferencesResult, statusResult] =
                await Promise.all([
                    this.getTiming(),
                    this.getPreferences(),
                    this.getScheduleStatus(),
                ]);

            if (
                !timingResult.success || !preferencesResult.success ||
                !statusResult.success
            ) {
                const errors = [
                    timingResult.error,
                    preferencesResult.error,
                    statusResult.error,
                ].filter(Boolean);

                return {
                    success: false,
                    error: `Failed to load notification data: ${
                        errors.join(", ")
                    }`,
                };
            }

            return {
                success: true,
                data: {
                    timing: timingResult.data!,
                    preferences: preferencesResult.data!,
                    scheduleStatus: statusResult.data!,
                },
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error
                    ? error.message
                    : "Unknown error loading notification data",
            };
        }
    }

    /**
     * Save all notification data
     */
    async setAllData(
        data: NotificationStorageData,
    ): Promise<StorageResult<NotificationStorageData>> {
        try {
            const [timingResult, preferencesResult, statusResult] =
                await Promise.all([
                    this.setTiming(data.timing),
                    this.setPreferences(data.preferences),
                    this.setScheduleStatus(data.scheduleStatus),
                ]);

            if (
                !timingResult.success || !preferencesResult.success ||
                !statusResult.success
            ) {
                const errors = [
                    timingResult.error,
                    preferencesResult.error,
                    statusResult.error,
                ].filter(Boolean);

                return {
                    success: false,
                    error: `Failed to save notification data: ${
                        errors.join(", ")
                    }`,
                };
            }

            return {
                success: true,
                data,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error
                    ? error.message
                    : "Unknown error saving notification data",
            };
        }
    }

    /**
     * Reset preferences to defaults
     */
    async resetPreferences(): Promise<StorageResult<NotificationPreferences>> {
        const defaults = {
            morningReminders: true,
            eveningReminders: false,
            weeklyStreaks: true,
            middayReflection: true,
        };
        return this.setPreferences(defaults);
    }

    /**
     * Reset timing to defaults
     */
    async resetTiming(): Promise<StorageResult<NotificationTiming>> {
        const defaults = {
            morningTime: "08:00",
            middayTime: "12:00",
            eveningTime: "18:00",
        };
        return this.setTiming(defaults);
    }

    /**
     * Check if notification data exists
     */
    async hasNotificationData(): Promise<StorageResult<boolean>> {
        try {
            const keys = await this.getAllKeys();
            const hasData = keys.some((key) =>
                key.startsWith(`${this.namespace}_`)
            );
            return { success: true, data: hasData };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error
                    ? error.message
                    : "Unknown error checking data",
                data: false,
            };
        }
    }

    /**
     * Get all storage keys for this namespace
     */
    private async getAllKeys(): Promise<string[]> {
        const AsyncStorage =
            (await import("@react-native-async-storage/async-storage")).default;
        const keys = await AsyncStorage.getAllKeys();
        return [...keys]; // Convert readonly array to mutable
    }

    /**
     * Clear all notification storage
     */
    async clearAll(): Promise<StorageResult<void>> {
        return this.clear();
    }
}

// Export singleton instance
export const notificationStorage = new NotificationStorage();
