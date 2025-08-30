// useTimelineData.ts
import { useDateTimePreferences } from "@/shared/hooks/useDateTimePreferences";
import { useActivitiesStore, useTimeslicesStore } from "@/shared/stores";
import { Timeslice } from "@/shared/types/models";
import { useUser } from "@clerk/clerk-expo";
import { useMemo } from "react";

/**
 * Custom hook to manage timeline data including today's and yesterday's timeslices
 */
export const useTimelineData = (date: Date) => {
  const user_id = useUser().user?.id ?? null;
  const activities = useActivitiesStore((state) => state.activities);
  const timeslices = useTimeslicesStore((state) => state.timeslices);
  const preferences = useDateTimePreferences();

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
      existingTimeslices: Timeslice[]
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

  // Use the provided date as 'today'
  const dateForDisplay = useMemo(() => new Date(date), [date]);

  // Generate time slot placeholders
  const TimeslicePlaceholders = useMemo(
    () => generateTimeSlots(dateForDisplay),
    [generateTimeSlots, dateForDisplay]
  );

  // Get existing timeslices for today and yesterday
  const ExistingTimeslices = useMemo(
    () => filterTimeslicesByDate(dateForDisplay),
    [filterTimeslicesByDate, dateForDisplay]
  );

  // Merge empty slots with existing timeslices
  const Timeslices = useMemo(
    () => mergeTimeslices(TimeslicePlaceholders, ExistingTimeslices),
    [mergeTimeslices, TimeslicePlaceholders, ExistingTimeslices]
  );

  return {
    Timeslices,
    activities,
    dateForDisplay,
  };
};
