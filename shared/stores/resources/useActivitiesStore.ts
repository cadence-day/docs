import * as activitiesApi from "@/shared/api/resources/activities";
import { activityOrderStorage } from "@/shared/storage/activities";
import type { Activity } from "@/shared/types/models";
import { Logger } from "@/shared/utils/errorHandler";
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
  disabledActivities: Activity[];
  deletedActivities: Activity[];

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

  // Enable operations
  enableActivity: (id: string) => Promise<void>;
  enableActivities: (ids: string[]) => Promise<void>;

  // Upsert operations
  upsertActivity: (
    activity: Omit<Activity, "id"> & Partial<Pick<Activity, "id">>,
  ) => Promise<Activity | null>;
  upsertActivities: (
    activities: (Omit<Activity, "id"> & Partial<Pick<Activity, "id">>)[],
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
  updateActivityOrder: (reorderedActivities: Activity[]) => Promise<void>;
  loadStoredOrder: () => Promise<void>;

  // Utility functions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const useActivitiesStore = create<ActivitiesStore>((set, get) => ({
  // Initial state
  activities: [],
  disabledActivities: [],
  deletedActivities: [],
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
          : {},
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
          : {},
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
          : {},
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
          : {},
    );
  },

  disableActivity: async (id: string) => {
    return handleVoidApiCall(
      set,
      async () => {
        await activitiesApi.disableActivity(id);
        // Update stored order to maintain position when re-enabled
        const allActivities = [
          ...get().activities,
          ...get().disabledActivities,
          ...get().deletedActivities,
        ];
        await activityOrderStorage.updateActivityStatus(
          allActivities,
          id,
          "DISABLED",
        );
      },
      "disable activity",
      (state) => {
        const activityToDisable = state.activities.find((a) => a.id === id);
        if (activityToDisable) {
          const disabledActivity = {
            ...activityToDisable,
            status: "DISABLED",
          } as Activity;
          return {
            activities: state.activities.filter((a) => a.id !== id),
            disabledActivities: [...state.disabledActivities, disabledActivity],
          };
        }
        return {};
      },
    );
  },

  disableActivities: async (ids: string[]) => {
    return handleVoidApiCall(
      set,
      () => activitiesApi.disableActivities(ids),
      "disable activities",
      (state) => {
        const activitiesToDisable = state.activities.filter(
          (a) => a.id !== undefined && a.id !== null && ids.includes(a.id),
        );
        const disabledActivities = activitiesToDisable.map(
          (a) => ({ ...a, status: "DISABLED" }) as Activity,
        );

        return {
          activities: state.activities.filter(
            (a) =>
              a.id !== undefined &&
              a.id !== null &&
              !ids.includes(a.id as string),
          ),
          disabledActivities: [
            ...state.disabledActivities,
            ...disabledActivities,
          ],
        };
      },
    );
  },

  enableActivity: async (id: string) => {
    return handleVoidApiCall(
      set,
      async () => {
        const activity = get().disabledActivities.find((a) => a.id === id);
        if (activity) {
          await activitiesApi.updateActivity({
            ...activity,
            status: "ENABLED",
          });
          // Update stored order to restore position
          const allActivities = [
            ...get().activities,
            ...get().disabledActivities,
            ...get().deletedActivities,
          ];
          await activityOrderStorage.updateActivityStatus(
            allActivities,
            id,
            "ENABLED",
          );
        }
      },
      "enable activity",
      (state) => {
        const activityToEnable = state.disabledActivities.find(
          (a) => a.id === id,
        );
        if (activityToEnable) {
          const enabledActivity = {
            ...activityToEnable,
            status: "ENABLED",
          } as Activity;
          return {
            disabledActivities: state.disabledActivities.filter(
              (a) => a.id !== id,
            ),
            activities: [...state.activities, enabledActivity],
          };
        }
        return {};
      },
    );
  },

  enableActivities: async (ids: string[]) => {
    return handleVoidApiCall(
      set,
      async () => {
        const activities = get().disabledActivities.filter(
          (a) => a.id !== undefined && a.id !== null && ids.includes(a.id),
        );
        const enabledActivities = activities.map(
          (a) => ({ ...a, status: "ENABLED" }) as Activity,
        );
        await activitiesApi.updateActivities(enabledActivities);
      },
      "enable activities",
      (state) => {
        const activitiesToEnable = state.disabledActivities.filter(
          (a) =>
            a.id !== undefined && a.id !== null && ids.includes(a.id as string),
        );
        const enabledActivities = activitiesToEnable.map(
          (a) => ({ ...a, status: "ENABLED" }) as Activity,
        );

        return {
          disabledActivities: state.disabledActivities.filter(
            (a) =>
              a.id !== undefined &&
              a.id !== null &&
              !ids.includes(a.id as string),
          ),
          activities: [...state.activities, ...enabledActivities],
        };
      },
    );
  },

  softDeleteActivity: async (id: string) => {
    return handleVoidApiCall(
      set,
      async () => {
        await activitiesApi.softDeleteActivity(id);
        // Remove from stored order since it's deleted
        await activityOrderStorage.removeFromOrder(id);
      },
      "delete activity",
      (state) => {
        const activityToDelete = state.activities.find((a) => a.id === id) ||
          state.disabledActivities.find((a) => a.id === id);
        if (activityToDelete) {
          const deletedActivity = {
            ...activityToDelete,
            status: "DELETED",
          } as Activity;
          return {
            activities: state.activities.filter((a) => a.id !== id),
            disabledActivities: state.disabledActivities.filter(
              (a) => a.id !== id,
            ),
            deletedActivities: [...state.deletedActivities, deletedActivity],
          };
        }
        return {};
      },
    );
  },

  softDeleteActivities: async (ids: string[]) => {
    return handleVoidApiCall(
      set,
      () => activitiesApi.softDeleteActivities(ids),
      "delete activities",
      (state) => {
        const activitiesToDelete = [
          ...state.activities.filter(
            (a) =>
              a.id !== undefined &&
              a.id !== null &&
              ids.includes(a.id as string),
          ),
          ...state.disabledActivities.filter(
            (a) =>
              a.id !== undefined &&
              a.id !== null &&
              ids.includes(a.id as string),
          ),
        ];
        const deletedActivities = activitiesToDelete.map(
          (a) => ({ ...a, status: "DELETED" }) as Activity,
        );

        return {
          activities: state.activities.filter(
            (a) =>
              a.id !== undefined &&
              a.id !== null &&
              !ids.includes(a.id as string),
          ),
          disabledActivities: state.disabledActivities.filter(
            (a) =>
              a.id !== undefined &&
              a.id !== null &&
              !ids.includes(a.id as string),
          ),
          deletedActivities: [...state.deletedActivities, ...deletedActivities],
        };
      },
    );
  },

  upsertActivity: async (
    activity: Omit<Activity, "id"> & Partial<Pick<Activity, "id">>,
  ) => {
    return handleApiCall(
      set,
      () => activitiesApi.upsertActivity(activity),
      "upsert activity",
      null,
      (upsertedActivity, state) => {
        if (!upsertedActivity) return {};

        const existingIndex = state.activities.findIndex(
          (a) => a.id === upsertedActivity.id,
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
      },
    );
  },

  upsertActivities: async (
    activities: (Omit<Activity, "id"> & Partial<Pick<Activity, "id">>)[],
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
            (a) => a.id === upserted.id,
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
      },
    );
  },

  refresh: async () => {
    return handleVoidApiCallWithResult(
      set,
      async () => {
        // Fetch enabled activities from remote database
        const activities = await activitiesApi.getAllEnabledActivities();

        // Load and sort activities with stored order
        const orderResult = await activityOrderStorage.getOrder();
        return activityOrderStorage.sortActivitiesByStoredOrder(
          activities,
          orderResult.data,
        );
      },
      "refresh activities",
      (sortedActivities) => ({
        activities: sortedActivities,
      }),
    );
  },

  // Get operations
  getActivity: async (id: string) => {
    return handleGetApiCall(
      set,
      () => activitiesApi.getActivity(id),
      "get activity",
      null,
    );
  },

  getActivities: async (ids: string[]) => {
    return handleGetApiCall(
      set,
      () => activitiesApi.getActivities(ids),
      "get activities",
      [],
    );
  },

  getEnabledUserActivities: async (userId: string) => {
    return handleGetApiCall(
      set,
      () => activitiesApi.getEnabledUserActivities(userId),
      "get user activities",
      [],
    );
  },

  getAllActivities: async () => {
    return handleApiCall(
      set,
      () => activitiesApi.getAllActivities(),
      "get all activities",
      [],
      (allActivities) => {
        // Separate activities by status to prevent duplicates
        const enabledActivities =
          allActivities?.filter((a) => a.status === "ENABLED") || [];
        const disabledActivities =
          allActivities?.filter((a) => a.status === "DISABLED") || [];
        const deletedActivities =
          allActivities?.filter((a) => a.status === "DELETED") || [];

        return {
          activities: enabledActivities,
          disabledActivities: disabledActivities,
          deletedActivities: deletedActivities,
        };
      },
    );
  },

  getAllDisabledActivities: async () => {
    return handleApiCall(
      set,
      () => activitiesApi.getAllDisabledActivities(),
      "get disabled activities",
      [],
      (disabledActivities) => ({
        disabledActivities: disabledActivities || [],
      }),
    );
  },

  getAllDeletedActivities: async () => {
    return handleApiCall(
      set,
      () => activitiesApi.getAllDeletedActivities(),
      "get deleted activities",
      [],
      (deletedActivities) => ({
        deletedActivities: deletedActivities || [],
      }),
    );
  },

  getEnabledActivitiesByCategory: async (categoryId: string) => {
    return handleGetApiCall(
      set,
      () => activitiesApi.getEnabledActivitiesByCategory(categoryId),
      "get activities by category",
      [],
    );
  },

  // Local state management for ordering
  updateActivityOrder: async (reorderedActivities: Activity[]) => {
    try {
      const saved = await activityOrderStorage.saveOrder(reorderedActivities);
      if (saved) {
        set({
          activities: reorderedActivities.filter((a) => a.status === "ENABLED"),
        });
      } else {
        Logger.logError(
          new Error("Failed to save activity order"),
          "updateActivityOrder",
          { activitiesCount: reorderedActivities.length },
        );
      }
    } catch (error) {
      Logger.logError(error, "updateActivityOrder", {
        activitiesCount: reorderedActivities.length,
        operationType: "save_activity_order",
      });
      // Still update the state even if storage fails
      set({
        activities: reorderedActivities.filter((a) => a.status === "ENABLED"),
      });
    }
  },

  loadStoredOrder: async () => {
    try {
      const currentActivities = get().activities;
      const orderResult = await activityOrderStorage.getOrder();

      if (orderResult.success && orderResult.data) {
        const allActivities = [
          ...currentActivities,
          ...get().disabledActivities,
          ...get().deletedActivities,
        ];
        const sortedActivities = activityOrderStorage
          .sortActivitiesByStoredOrder(
            allActivities,
            orderResult.data,
          );
        const enabledActivities = sortedActivities.filter(
          (a) => a.status === "ENABLED",
        );
        set({ activities: enabledActivities });
      }
    } catch (error) {
      Logger.logError(error, "loadStoredOrder", {
        operation: "load_and_apply_stored_order",
      });
    }
  },

  // Utility functions
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  reset: () =>
    set({
      activities: [],
      disabledActivities: [],
      deletedActivities: [],
      isLoading: false,
      error: null,
    }),
}));

export default useActivitiesStore;
