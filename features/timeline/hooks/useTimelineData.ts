// useTimelineData.ts
import { useActivitiesStore, useTimeslicesStore } from "@/shared/stores";
import { Activity, Timeslice } from "@/shared/types/models";
import { Logger } from "@/shared/utils/errorHandler";
import { useUser } from "@clerk/clerk-expo";
import { useMemo } from "react";

// Optional external listeners can be passed in via a small options bag.
export interface UseTimelineDataOptions {
  // A lightweight activity provider to avoid importing the full activities store
  getActivities?: () => Activity[];
}

/**
 * Custom hook to manage timeline data including today's and yesterday's timeslices
 */
export const useTimelineData = (
  date: Date,
  options?: UseTimelineDataOptions,
) => {
  // Guard access to Clerk's user object. In some environments `useUser().user`
  // may be a primitive or a shape we don't expect; ensure we only read `id`
  // when `user` is an object with a string `id`. This prevents unexpected
  // telemetry errors like "Value is a number, expected an Object".
  const clerkUser = useUser().user;
  const user_id = clerkUser ? clerkUser.id : null;
  // Prefer injected activities getter, otherwise fall back to empty array
  // Grab enabled/disabled activities from the activities store so disabled
  // activities' colors/metadata are available to timeline rendering.
  const enabledActivitiesFromStore = useActivitiesStore((s) => s.activities);
  const disabledActivitiesFromStore = useActivitiesStore(
    (s) => s.disabledActivities,
  );

  const activities = useMemo(() => {
    try {
      // Allow an injected getter to override (used in tests or special callers)
      if (options?.getActivities) return options.getActivities();

      // Combine enabled and disabled activities so the UI can access colors
      return [
        ...(enabledActivitiesFromStore || []),
        ...(disabledActivitiesFromStore || []),
      ];
    } catch (error) {
      Logger.logError(
        error as Error,
        "useTimelineData:getActivities",
        {},
      );
      return [];
    }
  }, [options, enabledActivitiesFromStore, disabledActivitiesFromStore]);

  const timeslices = useTimeslicesStore((state) => state.timeslices ?? []);

  // Ensure date is a valid Date object
  const validDate = useMemo(() => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      Logger.logWarning(
        "useTimelineData received invalid date",
        "useTimelineData:date",
        { date },
      );
      return new Date();
    }
    return date;
  }, [date]);

  // Generate all 30-minute time slots for a given date (empty timeslices)
  const generateTimeSlots = useMemo(() => {
    return (date: Date): Timeslice[] => {
      const slots: Timeslice[] = [];

      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          // Create local time for the specific time slot
          const localStartTime = new Date(date);
          localStartTime.setHours(hour, minute, 0, 0);
          const localEndTime = new Date(localStartTime);
          localEndTime.setMinutes(localEndTime.getMinutes() + 30);

          slots.push({
            id: null,
            start_time: localStartTime.toISOString(),
            end_time: localEndTime.toISOString(),
            activity_id: null,
            state_id: null,
            user_id: user_id,
            note_ids: null,
          } as Timeslice);
        }
      }

      return slots;
    };
  }, [user_id]);

  // Merge existing timeslices with empty slots
  const mergeTimeslices = useMemo(() => {
    return (
      slots: Timeslice[],
      existingTimeslices: Timeslice[],
    ): Timeslice[] => {
      const merged = slots.map((slot) => {
        const existing = existingTimeslices.find((ts) => {
          if (!ts.start_time || !slot.start_time) return false;

          // Compare UTC times directly (both are already in UTC)
          const existingStartUtc = new Date(ts.start_time);
          const slotStartUtc = new Date(slot.start_time);

          // Match if the times are within the same 30-minute slot
          return (
            Math.abs(existingStartUtc.getTime() - slotStartUtc.getTime()) <
              30 * 60 * 1000
          );
        });
        return existing || slot;
      });

      return merged;
    };
  }, []);

  // Filter timeslices from the store for a specific date
  const filterTimeslicesByDate = useMemo(() => {
    return (date: Date) => {
      const startOfDayUTC = new Date(date);
      startOfDayUTC.setHours(0, 0, 0, 0);
      const endOfDayUTC = new Date(date);
      endOfDayUTC.setDate(endOfDayUTC.getDate() + 1);
      endOfDayUTC.setHours(0, 0, 0, 0);

      const filtered = timeslices.filter((ts) => {
        if (!ts.start_time) return false;
        // Compare UTC times directly
        const tsUtc = new Date(ts.start_time);
        const inRange = tsUtc >= startOfDayUTC && tsUtc <= endOfDayUTC;
        return inRange;
      });
      return filtered;
    };
  }, [timeslices]);

  // Use the validated date as 'today'
  const dateForDisplay = useMemo(() => new Date(validDate), [validDate]);

  // Generate time slot placeholders
  const TimeslicePlaceholders = useMemo(
    () => generateTimeSlots(dateForDisplay),
    [generateTimeSlots, dateForDisplay],
  );

  // Get existing timeslices for today and yesterday
  const ExistingTimeslices = useMemo(
    () => filterTimeslicesByDate(dateForDisplay),
    [filterTimeslicesByDate, dateForDisplay],
  );

  // Merge empty slots with existing timeslices
  const Timeslices = useMemo(
    () => mergeTimeslices(TimeslicePlaceholders, ExistingTimeslices),
    [mergeTimeslices, TimeslicePlaceholders, ExistingTimeslices],
  );

  return {
    Timeslices,
    activities,
    dateForDisplay,
  };
};
