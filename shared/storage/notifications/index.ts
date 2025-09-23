import type {
    NotificationPreferences,
    NotificationScheduleStatus,
    NotificationTiming,
} from "@/shared/stores/resources/useNotificationStore";
import { BaseStorage } from "../base";
import type { StorageResult } from "../types";

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
            middayTime: "12:00",
            eveningTimeStart: "20:00",
            eveningTimeEnd: "21:30",
            isAutomatic: true,
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
                    timing: timingResult.data,
                    preferences: preferencesResult.data,
                    scheduleStatus: statusResult.data,
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
     * Clear all notification storage
     */
    async clearAll(): Promise<StorageResult<void>> {
        return this.clear();
    }
}

// Export singleton instance
export const notificationStorage = new NotificationStorage();
