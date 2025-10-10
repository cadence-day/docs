import { useI18n } from "@/shared/hooks/useI18n";
import {
  useActivitiesStore,
  useNotesStore,
  useStatesStore,
  useTimeslicesStore,
} from "@/shared/stores";
import type { State } from "@/shared/types/models";
import { Logger } from "@/shared/utils/errorHandler";
import { useMemo } from "react";
import type {
  ActivityStatistics,
  EnhancedTimesliceInformation,
  TimesliceStatistics,
} from "../types";

export interface UseTimesliceStatisticsReturn {
  statistics: TimesliceStatistics;
  isLoading: boolean;
  error: string | null;
  getActivityStats: (activityId: string) => ActivityStatistics | undefined;
  getActivityDailyTotal: (activityId: string, targetDate: Date) => number;
  getActivityWeeklyTotal: (activityId: string) => number;
  getTimesliceWithDetails: (
    timesliceId: string,
  ) => Promise<EnhancedTimesliceInformation>;
}

/**
 * Hook to compute comprehensive timeslice statistics for a given date range
 */
export const useTimesliceStatistics = (
  fromDate: Date,
  toDate: Date,
): UseTimesliceStatisticsReturn => {
  const { t } = useI18n();
  const timeslicesStore = useTimeslicesStore();
  const activitiesStore = useActivitiesStore();
  const notesStore = useNotesStore();
  const statesStore = useStatesStore();

  // Get filtered timeslices for the date range
  const timeslicesInRange = useMemo(() => {
    const allTimeslices = timeslicesStore.timeslices || [];
    return allTimeslices.filter((timeslice) => {
      if (!timeslice.start_time) return false;
      const startTime = new Date(timeslice.start_time);
      return startTime >= fromDate && startTime <= toDate;
    });
  }, [timeslicesStore.timeslices, fromDate, toDate]);

  // Compute comprehensive statistics
  const statistics = useMemo<TimesliceStatistics>(() => {
    try {
      const activitiesMap = new Map<string, ActivityStatistics>();
      const allEnergyLevels: number[] = [];
      let totalNotes = 0;

      // Process each timeslice to build statistics
      timeslicesInRange.forEach((timeslice) => {
        const activityId = timeslice.activity_id;
        if (!activityId) return;

        // Get or create activity stats
        if (!activitiesMap.has(activityId)) {
          const activity = activitiesStore.activities.find(
            (a) => a.id === activityId,
          );
          activitiesMap.set(activityId, {
            activityId,
            activityName: activity?.name || t("reflection.unknownActivity"),
            activityColor: activity?.color || "#cccccc",
            totalTimeslices: 0,
            totalHours: 0,
            totalNotes: 0,
            averageEnergy: null,
            energyLevels: [],
            notesList: [],
            timesliceIds: [],
          });
        }

        const activityStats = activitiesMap.get(activityId)!;

        // Update basic counts
        activityStats.totalTimeslices++;
        activityStats.totalHours += 0.5; // Each timeslice is 30 minutes
        if (timeslice.id) {
          activityStats.timesliceIds.push(timeslice.id);
        }

        // Process energy levels
        if (timeslice.state_id) {
          const state = statesStore.states.find(
            (s) => s.id === timeslice.state_id,
          );
          if (state?.energy !== null && state?.energy !== undefined) {
            const energy = Number(state.energy);
            if (!isNaN(energy)) {
              activityStats.energyLevels.push(energy);
              allEnergyLevels.push(energy);
            }
          }
        }

        // Process notes
        if (timeslice.note_ids && timeslice.note_ids.length > 0) {
          const timesliceNotes = notesStore.notes.filter(
            (note) => note.id && timeslice.note_ids?.includes(note.id),
          );
          activityStats.notesList.push(...timesliceNotes);
          activityStats.totalNotes += timesliceNotes.length;
          totalNotes += timesliceNotes.length;
        }
      });

      // Calculate average energy for each activity
      activitiesMap.forEach((stats) => {
        if (stats.energyLevels.length > 0) {
          stats.averageEnergy = stats.energyLevels.reduce((sum, energy) =>
            sum + energy, 0) /
            stats.energyLevels.length;
        }
      });

      // Calculate overall average energy
      const overallAverageEnergy = allEnergyLevels.length > 0
        ? allEnergyLevels.reduce((sum, energy) => sum + energy, 0) /
          allEnergyLevels.length
        : null;

      const activitiesStats = Array.from(activitiesMap.values()).sort(
        (a, b) => b.totalTimeslices - a.totalTimeslices,
      );

      return {
        totalTimeslices: timeslicesInRange.length,
        totalHours: timeslicesInRange.length * 0.5,
        totalNotes,
        activitiesStats,
        overallAverageEnergy,
        dateRange: {
          from: fromDate,
          to: toDate,
          formattedRange:
            `${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}`,
        },
      };
    } catch (error) {
      Logger.logError(
        error,
        "useTimesliceStatistics.computeStats",
        {
          fromDate: fromDate.toISOString(),
          toDate: toDate.toISOString(),
          timeslicesCount: timeslicesInRange.length,
        },
      );

      return {
        totalTimeslices: 0,
        totalHours: 0,
        totalNotes: 0,
        activitiesStats: [],
        overallAverageEnergy: null,
        dateRange: {
          from: fromDate,
          to: toDate,
          formattedRange:
            `${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}`,
        },
      };
    }
  }, [
    timeslicesInRange,
    activitiesStore.activities,
    notesStore.notes,
    statesStore.states,
    fromDate,
    toDate,
    t,
  ]);

  // Helper function to get stats for a specific activity
  const getActivityStats = (
    activityId: string,
  ): ActivityStatistics | undefined => {
    return statistics.activitiesStats.find(
      (stats) => stats.activityId === activityId,
    );
  };

  // Helper function to calculate daily total for a specific activity
  const getActivityDailyTotal = (
    activityId: string,
    targetDate: Date,
  ): number => {
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const dayTimeslices = timeslicesInRange.filter(
      (ts) =>
        ts.activity_id === activityId &&
        ts.start_time &&
        new Date(ts.start_time) >= startOfDay &&
        new Date(ts.start_time) <= endOfDay,
    );

    return dayTimeslices.reduce((total, ts) => {
      if (ts.start_time && ts.end_time) {
        const durationMs = new Date(ts.end_time).getTime() -
          new Date(ts.start_time).getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        return total + durationHours;
      }
      return total;
    }, 0);
  };

  // Helper function to calculate weekly total for a specific activity
  const getActivityWeeklyTotal = (activityId: string): number => {
    const activityStats = getActivityStats(activityId);
    return activityStats ? activityStats.totalHours : 0;
  };

  // Enhanced function to get detailed timeslice information
  const getTimesliceWithDetails = async (timesliceId: string) => {
    try {
      const timeslice = timeslicesInRange.find((ts) => ts.id === timesliceId);
      if (!timeslice) {
        return {
          timeslice: undefined,
          activity: undefined,
          state: undefined,
          notes: [],
          energyLevel: null,
        };
      }

      // Get activity
      const activity = activitiesStore.activities.find(
        (a) => a.id === timeslice.activity_id,
      );

      // Get state and energy level
      let state: State | undefined;
      let energyLevel: number | null = null;
      if (timeslice.state_id) {
        state = statesStore.states.find((s) => s.id === timeslice.state_id);
        if (state?.energy !== null && state?.energy !== undefined) {
          energyLevel = Number(state.energy);
          if (isNaN(energyLevel)) {
            energyLevel = null;
          }
        }
      }

      // Get notes - fetch from API if not in store
      const notes = timeslice.note_ids?.length
        ? await notesStore.getNotes(timeslice.note_ids)
        : [];

      // Calculate activity-specific daily and weekly totals
      const timesliceDate = timeslice.start_time
        ? new Date(timeslice.start_time)
        : new Date();
      const hoursOfActivityInDay = activity?.id
        ? getActivityDailyTotal(activity.id, timesliceDate)
        : 0;
      const hoursOfActivityInView = activity?.id
        ? getActivityWeeklyTotal(activity.id)
        : 0;

      // Get activity statistics for this specific activity
      const activityStats = activity?.id
        ? getActivityStats(activity.id)
        : undefined;

      return {
        timeslice,
        activity,
        noteList: notes,
        state,
        energyLevel,
        statistics,
        hoursOfActivityInView,
        hoursOfActivityInDay,
        activityStats,
      } as EnhancedTimesliceInformation;
    } catch (error) {
      Logger.logError(
        error,
        "useTimesliceStatistics.getTimesliceWithDetails",
        {
          timesliceId,
        },
      );

      return {
        timeslice: undefined,
        activity: undefined,
        noteList: [],
        state: undefined,
        energyLevel: null,
        statistics,
        hoursOfActivityInView: 0,
        hoursOfActivityInDay: 0,
        activityStats: undefined,
      } as EnhancedTimesliceInformation;
    }
  };

  return {
    statistics,
    isLoading: false, // Data is already available from stores
    error: null,
    getActivityStats,
    getActivityDailyTotal,
    getActivityWeeklyTotal,
    getTimesliceWithDetails,
  };
};
