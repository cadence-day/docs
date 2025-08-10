import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Activity } from "@/shared/types/models";

const ACTIVITY_ORDER_KEY = "activity_order";

/**
 * Save activity order to local storage
 * Stores an array of activity IDs in their desired order
 */
export const saveActivityOrderToStorage = async (
    activities: Activity[],
): Promise<void> => {
    try {
        const activityIds = activities.map((activity) => activity.id).filter(
            Boolean,
        );
        await AsyncStorage.setItem(
            ACTIVITY_ORDER_KEY,
            JSON.stringify(activityIds),
        );
        console.log("Activity order saved to local storage:", activityIds);
    } catch (error) {
        console.error("Failed to save activity order to storage:", error);
        throw error;
    }
};

/**
 * Load activity order from local storage
 * Returns an array of activity IDs in their saved order
 */
export const loadActivityOrderFromStorage = async (): Promise<string[]> => {
    try {
        const stored = await AsyncStorage.getItem(ACTIVITY_ORDER_KEY);
        if (stored) {
            const activityIds = JSON.parse(stored) as string[];
            console.log(
                "Activity order loaded from local storage:",
                activityIds,
            );
            return activityIds;
        }
        return [];
    } catch (error) {
        console.error("Failed to load activity order from storage:", error);
        return [];
    }
};

/**
 * Sort activities array according to saved order
 * Activities not in saved order will appear at the end
 */
export const sortActivitiesByStoredOrder = (
    activities: Activity[],
    storedOrder: string[],
): Activity[] => {
    if (storedOrder.length === 0) {
        return activities; // Return original order if no stored order
    }

    const sortedActivities: Activity[] = [];
    const remainingActivities: Activity[] = [];

    // First, add activities in the stored order
    storedOrder.forEach((activityId) => {
        const activity = activities.find((a) => a.id === activityId);
        if (activity) {
            sortedActivities.push(activity);
        }
    });

    // Then, add any activities that weren't in the stored order
    activities.forEach((activity) => {
        if (activity.id && !storedOrder.includes(activity.id)) {
            remainingActivities.push(activity);
        }
    });

    return [...sortedActivities, ...remainingActivities];
};

/**
 * Clear activity order from local storage
 */
export const clearActivityOrderFromStorage = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(ACTIVITY_ORDER_KEY);
        console.log("Activity order cleared from local storage");
    } catch (error) {
        console.error("Failed to clear activity order from storage:", error);
        throw error;
    }
};
