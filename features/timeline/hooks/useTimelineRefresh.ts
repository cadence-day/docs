// useTimelineRefresh.ts
import useTimeslicesStore from "@/shared/stores/resources/useTimeslicesStore";
import * as Haptics from "expo-haptics";
import { useCallback, useState } from "react";

/**
 * Custom hook to handle timeline refresh functionality
 *
 * This hook fetches timeslices for yesterday and today and upserts them
 * into the timeslices store so the UI updates from the central store.
 */
export const useTimelineRefresh = () => {
  const [refreshing, setRefreshing] = useState(false);
  const isTimelineLoading = useTimeslicesStore((s) => s.isLoading);

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
      const fetched = await useTimeslicesStore
        .getState()
        .getTimeslicesFromTo(startOfYesterday, startOfTomorrow);

      // Upsert into store so components relying on the store update
      if (fetched && fetched.length > 0) {
        await useTimeslicesStore.getState().upsertTimeslices(fetched);
      }

      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("useTimelineRefresh:onRefresh failed", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return {
    refreshing,
    isTimelineLoading,
    onRefresh,
  };
};
