import * as activitiesApi from "@/shared/api/resources/activities";
import type { Activity } from "@/shared/types/models";
import {
  loadActivityOrderFromStorage,
  saveActivityOrderToStorage,
  sortActivitiesByStoredOrder,
} from "@/shared/utils/activityOrderStorage";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { create } from "zustand";
import {
  type BaseStoreState,
  handleApiCall,
  handleGetApiCall,
  handleVoidApiCall,
  handleVoidApiCallWithResult,
} from "../utils/utils";

interface ActivitiesStore extends BaseStoreState {
  // State
  activities: Activity[];

  // Core operations
  // Insert operations
  insertActivity: (activity: Omit<Activity, "id">) => Promise<Activity | null>;
  insertActivities: (activities: Omit<Activity, "id">[]) => Promise<Activity[]>;

  // Update operations
  updateActivity: (activity: Activity) => Promise<Activity | null>;
  updateActivities: (activities: Activity[]) => Promise<Activity[] | null>;

  // Soft Delete operations
  softDeleteActivity: (id: string) => Promise<void>;
  softDeleteActivities: (ids: string[]) => Promise<void>;

  // Disable operations
  disableActivity: (id: string) => Promise<void>;
  disableActivities: (ids: string[]) => Promise<void>;

  // Upsert operations
  upsertActivity: (
    activity: Omit<Activity, "id"> & Partial<Pick<Activity, "id">>
  ) => Promise<Activity | null>;
  upsertActivities: (
    activities: (Omit<Activity, "id"> & Partial<Pick<Activity, "id">>)[]
  ) => Promise<Activity[]>;
  refresh: () => Promise<void>;

  // Get operations
  getActivity: (id: string) => Promise<Activity | null>;
  getActivities: (ids: string[]) => Promise<Activity[]>;
  getEnabledUserActivities: (userId: string) => Promise<Activity[]>;
  getAllActivities: () => Promise<Activity[]>;
  getAllDisabledActivities: () => Promise<Activity[]>;
  getAllDeletedActivities: () => Promise<Activity[]>;
  getEnabledActivitiesByCategory: (categoryId: string) => Promise<Activity[]>;

  // Local state management for ordering (not in the API - Implementation in the DB later)
  updateActivityOrder: (reorderedActivities: Activity[]) => void;

  // Utility functions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const useActivitiesStore = create<ActivitiesStore>((set, get) => ({
  // Initial state
  activities: [],
  isLoading: false,
  error: null,

  // Core operations
  insertActivity: async (activity: Omit<Activity, "id">) => {
    return handleApiCall(
      set,
      () => activitiesApi.insertActivity(activity),
      "create activity",
      null,
      (newActivity, state) =>
        newActivity
          ? {
              activities: [...state.activities, newActivity],
            }
          : {}
    );
  },

  insertActivities: async (activities: Omit<Activity, "id">[]) => {
    return handleApiCall(
      set,
      () => activitiesApi.insertActivities(activities),
      "create activities",
      [],
      (newActivities, state) =>
        newActivities.length > 0
          ? {
              activities: [...state.activities, ...newActivities],
            }
          : {}
    );
  },

  updateActivity: async (activity: Activity) => {
    return handleApiCall(
      set,
      () => activitiesApi.updateActivity(activity),
      "update activity",
      null,
      (updatedActivity, state) =>
        updatedActivity
          ? {
              activities: state.activities.map((a) =>
                a.id === updatedActivity.id ? updatedActivity : a
              ),
            }
          : {}
    );
  },

  updateActivities: async (activities: Activity[]) => {
    return handleApiCall(
      set,
      () => activitiesApi.updateActivities(activities),
      "update activities",
      null,
      (updatedActivities, state) =>
        updatedActivities && updatedActivities.length > 0
          ? {
              activities: state.activities.map((a) => {
                const updated = updatedActivities.find((ua) => ua.id === a.id);
                return updated || a;
              }),
            }
          : {}
    );
  },

  disableActivity: async (id: string) => {
    return handleVoidApiCall(
      set,
      () => activitiesApi.disableActivity(id),
      "disable activity",
      (state) => ({
        activities: state.activities.map((a) =>
          a.id === id ? { ...a, status: "DISABLED" } : a
        ),
      })
    );
  },

  disableActivities: async (ids: string[]) => {
    return handleVoidApiCall(
      set,
      () => activitiesApi.disableActivities(ids),
      "disable activities",
      (state) => ({
        activities: state.activities.map((a) =>
          a.id !== undefined && a.id !== null && ids.includes(a.id)
            ? { ...a, status: "DISABLED" }
            : a
        ),
      })
    );
  },

  softDeleteActivity: async (id: string) => {
    return handleVoidApiCall(
      set,
      () => activitiesApi.softDeleteActivity(id),
      "delete activity",
      (state) => ({
        activities: state.activities.filter((a) => a.id !== id),
      })
    );
  },

  softDeleteActivities: async (ids: string[]) => {
    return handleVoidApiCall(
      set,
      () => activitiesApi.softDeleteActivities(ids),
      "delete activities",
      (state) => ({
        activities: state.activities.filter(
          (a) =>
            a.id !== undefined && a.id !== null && !ids.includes(a.id as string)
        ),
      })
    );
  },

  upsertActivity: async (
    activity: Omit<Activity, "id"> & Partial<Pick<Activity, "id">>
  ) => {
    return handleApiCall(
      set,
      () => activitiesApi.upsertActivity(activity),
      "upsert activity",
      null,
      (upsertedActivity, state) => {
        if (!upsertedActivity) return {};

        const existingIndex = state.activities.findIndex(
          (a) => a.id === upsertedActivity.id
        );

        if (existingIndex >= 0) {
          // Update existing activity
          const updatedActivities = [...state.activities];
          updatedActivities[existingIndex] = upsertedActivity;
          return { activities: updatedActivities };
        } else {
          // Add new activity
          return { activities: [...state.activities, upsertedActivity] };
        }
      }
    );
  },

  upsertActivities: async (
    activities: (Omit<Activity, "id"> & Partial<Pick<Activity, "id">>)[]
  ) => {
    return handleApiCall(
      set,
      () => activitiesApi.upsertActivities(activities),
      "upsert activities",
      [],
      (upsertedActivities, state) => {
        if (upsertedActivities.length === 0) return {};

        const updatedActivities = [...state.activities];

        upsertedActivities.forEach((upserted) => {
          const existingIndex = updatedActivities.findIndex(
            (a) => a.id === upserted.id
          );
          if (existingIndex >= 0) {
            // Update existing activity
            updatedActivities[existingIndex] = upserted;
          } else {
            // Add new activity
            updatedActivities.push(upserted);
          }
        });

        return { activities: updatedActivities };
      }
    );
  },

  refresh: async () => {
    return handleVoidApiCallWithResult(
      set,
      async () => {
        // Fetch enabled activities from remote database
        const activities = await activitiesApi.getAllEnabledActivities();

        // Load and sort activities with stored order
        const storedOrder = await loadActivityOrderFromStorage();
        return sortActivitiesByStoredOrder(activities, storedOrder);
      },
      "refresh activities",
      (sortedActivities) => ({
        activities: sortedActivities,
      })
    );
  },

  // Get operations
  getActivity: async (id: string) => {
    return handleGetApiCall(
      set,
      () => activitiesApi.getActivity(id),
      "get activity",
      null
    );
  },

  getActivities: async (ids: string[]) => {
    return handleGetApiCall(
      set,
      () => activitiesApi.getActivities(ids),
      "get activities",
      []
    );
  },

  getEnabledUserActivities: async (userId: string) => {
    return handleGetApiCall(
      set,
      () => activitiesApi.getEnabledUserActivities(userId),
      "get user activities",
      []
    );
  },

  getAllActivities: async () => {
    return handleGetApiCall(
      set,
      () => activitiesApi.getAllActivities(),
      "get all activities",
      []
    );
  },

  getAllDisabledActivities: async () => {
    return handleGetApiCall(
      set,
      () => activitiesApi.getAllDisabledActivities(),
      "get disabled activities",
      []
    );
  },

  getAllDeletedActivities: async () => {
    return handleGetApiCall(
      set,
      () => activitiesApi.getAllDeletedActivities(),
      "get deleted activities",
      []
    );
  },

  getEnabledActivitiesByCategory: async (categoryId: string) => {
    return handleGetApiCall(
      set,
      () => activitiesApi.getEnabledActivitiesByCategory(categoryId),
      "get activities by category",
      []
    );
  },

  // Local state management for ordering
  updateActivityOrder: async (reorderedActivities: Activity[]) => {
    try {
      await saveActivityOrderToStorage(reorderedActivities);
      set({ activities: reorderedActivities });
    } catch (error) {
      GlobalErrorHandler.logError(error, "updateActivityOrder", {
        activitiesCount: reorderedActivities.length,
        operationType: "save_activity_order",
      });
      // Still update the state even if storage fails
      set({ activities: reorderedActivities });
    }
  },

  // Utility functions
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  reset: () => set({ activities: [], isLoading: false, error: null }),
}));

export default useActivitiesStore;
