import { useActivitiesStore } from "@/shared/stores";
import { useCallback, useEffect, useMemo } from "react";
import type { UseActivitiesDataReturn } from "../types";
import { sortActivities } from "../utils";
import { useErrorHandling } from "./useErrorHandling";

export const useActivitiesData = (): UseActivitiesDataReturn => {
  const { error, loadingState, handleAsyncOperation } = useErrorHandling();

  const enabledActivities = useActivitiesStore((state) => state.activities);
  const disabledActivitiesFromStore = useActivitiesStore(
    (state) => state.disabledActivities
  );
  const getAllActivities = useActivitiesStore(
    (state) => state.getAllActivities
  );
  const getAllDisabledActivities = useActivitiesStore(
    (state) => state.getAllDisabledActivities
  );

  // Memoize sorted activities for better performance
  const activities = useMemo(
    () => sortActivities(enabledActivities),
    [enabledActivities]
  );

  const disabledActivities = useMemo(
    () => sortActivities(disabledActivitiesFromStore),
    [disabledActivitiesFromStore]
  );

  const refresh = useCallback(async () => {
    await handleAsyncOperation(
      async () => {
        await Promise.all([getAllActivities(), getAllDisabledActivities()]);
      },
      {
        errorPrefix: "Failed to fetch activities",
        showHapticFeedback: false, // Don't vibrate for background data fetching
      }
    );
  }, [getAllActivities, getAllDisabledActivities, handleAsyncOperation]);

  // Initial fetch on mount - only if no data exists
  useEffect(() => {
    if (
      enabledActivities.length === 0 &&
      disabledActivitiesFromStore.length === 0 &&
      loadingState === "idle"
    ) {
      refresh();
    }
  }, [
    enabledActivities.length,
    disabledActivitiesFromStore.length,
    loadingState,
    refresh,
  ]);

  return {
    activities,
    disabledActivities,
    isLoading: loadingState === "loading",
    error,
    refresh,
  };
};
