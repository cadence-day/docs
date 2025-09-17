// useTimelineRefresh.ts
import useTimeslicesStore from "@/shared/stores/resources/useTimeslicesStore";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import * as Haptics from "expo-haptics";
import { useCallback } from "react";

/**
 * Custom hook to handle timeline refresh functionality
 *
 * This hook fetches timeslices for yesterday and today and upserts them
 * into the timeslices store so the UI updates from the central store.
 */
export const useTimelineRefresh = () => {
  const isRefreshing = useTimeslicesStore((s) => s.isRefreshing);
  const setRefreshing = useTimeslicesStore((s) => s.setRefreshing);
  const setError = useTimeslicesStore((s) => s.setError);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Compute range: start of yesterday -> start of tomorrow
      const now = new Date();
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);

      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);

      const startOfTomorrow = new Date(startOfToday);
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

      // Fetch fresh timeslices for yesterday and today
      const storeState = useTimeslicesStore.getState();
      const fetchFn = storeState.getTimeslicesFromTo;
      const fetched =
        typeof fetchFn === "function"
          ? await fetchFn(startOfYesterday, startOfTomorrow)
          : [];

      // Update the store directly with fresh data
      if (fetched && fetched.length > 0) {
        // Replace timeslices in the date range with fresh data
        try {
          useTimeslicesStore.setState((state) => {
            // Remove existing timeslices in the date range
            const filteredTimeslices = state.timeslices.filter((ts) => {
              if (!ts.start_time) return true;
              const tsDate = new Date(ts.start_time);
              return tsDate < startOfYesterday || tsDate >= startOfTomorrow;
            });

            // Add fresh timeslices
            return {
              timeslices: [...filteredTimeslices, ...fetched],
            };
          });
        } catch (err) {
          GlobalErrorHandler.logError(
            err as Error,
            "TIMELINE_REFRESH:SET_STATE",
            { fetchedCount: fetched.length }
          );
        }
      }

      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      GlobalErrorHandler.logError(error as Error, "TIMELINE_REFRESH", {});
      // Set error state if available
      try {
        setError(
          error instanceof Error ? error.message : "Failed to refresh timeline"
        );
      } catch (err) {
        GlobalErrorHandler.logWarning(
          "Failed to set refresh error",
          "TIMELINE_REFRESH",
          { error: err }
        );
      }
    } finally {
      setRefreshing(false);
    }
  }, [setRefreshing, setError]);

  return {
    isRefreshing,
    onRefresh,
  };
};
