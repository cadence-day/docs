import type { Activity, Timeslice } from "@/shared/types/models";
import { useMemo } from "react";
import useActivitiesStore from "../resources/useActivitiesStore";
import useTimeslicesStore from "../resources/useTimeslicesStore";
import useSelectionStore from "./useSelectionStore";

export function useCurrentlySelectedTimeslice(): Timeslice | null {
  const selectedId = useSelectionStore((s) => s.selectedTimesliceId);
  const timeslices = useTimeslicesStore((s) => s.timeslices);

  return useMemo(() => {
    if (!selectedId) return null;
    return timeslices.find((t) => t.id === selectedId) ?? null;
  }, [selectedId, timeslices]);
}

export function useCurrentlySelectedActivity(): Activity | null {
  const selectedActivityId = useSelectionStore((s) => s.selectedActivityId);
  const activities = useActivitiesStore((s) => s.activities);

  return useMemo(() => {
    if (!selectedActivityId) return null;
    return activities.find((a) => a.id === selectedActivityId) ?? null;
  }, [selectedActivityId, activities]);
}

export function useDateTimeslices(date: Date): Timeslice[] {
  const timeslices = useTimeslicesStore((s) => s.timeslices);

  return useMemo(() => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const nextDay = new Date(startOfDay);
    nextDay.setDate(nextDay.getDate() + 1);

    // Filter timeslices whose start_time is within [startOfDay, nextDay)
    const filtered = timeslices.filter((ts) => {
      if (!ts.start_time) return false;
      const tsDate = new Date(ts.start_time);
      return tsDate >= startOfDay && tsDate < nextDay;
    });

    // Sort by start_time ascending
    filtered.sort((a, b) => {
      const aTime = a.start_time ? new Date(a.start_time).getTime() : 0;
      const bTime = b.start_time ? new Date(b.start_time).getTime() : 0;
      return aTime - bTime;
    });

    return filtered;
  }, [date, timeslices]);
}
