import { getMoodLabel } from "@/shared/constants/Mood";
import {
  useActivitiesStore,
  useNotesStore,
  useStatesStore,
  useTimeslicesStore,
} from "@/shared/stores/resources";
import { Activity, Note, State, Timeslice } from "@/shared/types/models";
import {
  ActivityInsight,
  MoodInsight,
  NoteInsight,
  StreakData,
  WeeklyInsights,
} from "../types/insights";

/**
 * Calculate activity time insights from timeslices
 */
export const calculateActivityInsights = (
  timeslices: Timeslice[],
  activities: Activity[],
): { mostTime: ActivityInsight | null; leastTime: ActivityInsight | null } => {
  // Group timeslices by activity_id and sum durations
  const activityTimeMap = new Map<string, number>();

  timeslices.forEach((ts) => {
    if (!ts.activity_id || !ts.start_time || !ts.end_time) return;

    const startMs = Date.parse(String(ts.start_time));
    const endMs = Date.parse(String(ts.end_time));

    if (Number.isNaN(startMs) || Number.isNaN(endMs)) return;

    const durationMinutes = (endMs - startMs) / (1000 * 60);
    const currentTime = activityTimeMap.get(ts.activity_id) || 0;
    activityTimeMap.set(ts.activity_id, currentTime + durationMinutes);
  });

  if (activityTimeMap.size === 0) {
    return { mostTime: null, leastTime: null };
  }

  // Find most and least time activities
  let mostTimeActivityId: string | null = null;
  let leastTimeActivityId: string | null = null;
  let maxMinutes = -1;
  let minMinutes = Infinity;

  activityTimeMap.forEach((minutes, activityId) => {
    if (minutes > maxMinutes) {
      maxMinutes = minutes;
      mostTimeActivityId = activityId;
    }
    if (minutes < minMinutes) {
      minMinutes = minutes;
      leastTimeActivityId = activityId;
    }
  });

  const createActivityInsight = (
    activityId: string | null,
    minutes: number,
  ): ActivityInsight | null => {
    if (!activityId) return null;
    const activity = activities.find((a) => a.id === activityId);
    if (!activity) return null;

    return {
      activityId,
      activityName: activity.name,
      totalMinutes: Math.round(minutes),
      color: activity.color,
    };
  };

  return {
    mostTime: createActivityInsight(mostTimeActivityId, maxMinutes),
    leastTime: createActivityInsight(leastTimeActivityId, minMinutes),
  };
};

/**
 * Calculate note statistics from timeslices
 */
export const calculateNoteInsights = (
  timeslices: Timeslice[],
  notes: Note[],
): NoteInsight => {
  const noteIds = new Set<string>();

  // Collect note IDs from timeslices - note_ids is an array field
  timeslices.forEach((ts) => {
    // Check note_ids array (this is the correct field name based on schema)
    if (ts.note_ids && Array.isArray(ts.note_ids)) {
      ts.note_ids.forEach((id: any) => {
        // Handle both string and number IDs
        if (id !== null && id !== undefined) {
          noteIds.add(String(id));
        }
      });
    }
  });

  // If no note IDs found, return zeros
  if (noteIds.size === 0) {
    return {
      totalNotes: 0,
      totalWords: 0,
    };
  }

  // Filter notes that match the collected IDs
  const relevantNotes = notes.filter((note) => {
    if (!note || !note.id) return false;
    return noteIds.has(String(note.id));
  });

  // Calculate total words from all relevant notes
  const totalWords = relevantNotes.reduce((sum, note) => {
    // Try different possible field names for note content
    const content = (note as any).message || (note as any).content ||
      (note as any).text || "";
    if (!content || typeof content !== "string") return sum;

    // Split by whitespace and count non-empty words
    const words = content.trim().split(/\s+/).filter((word) => word.length > 0);
    return sum + words.length;
  }, 0);

  return {
    totalNotes: relevantNotes.length,
    totalWords,
  };
};

/**
 * Calculate mood statistics from timeslices
 */
export const calculateMoodInsights = (
  timeslices: Timeslice[],
  states: State[],
): MoodInsight => {
  const moodCounts = new Map<number, number>();
  let totalWithMood = 0;

  timeslices.forEach((ts) => {
    if (!ts.state_id) return;

    const state = states.find((s) => s.id === ts.state_id);
    if (!state || state.mood === null || state.mood === undefined) return;

    const currentCount = moodCounts.get(state.mood) || 0;
    moodCounts.set(state.mood, currentCount + 1);
    totalWithMood++;
  });

  if (totalWithMood === 0 || moodCounts.size === 0) {
    return {
      mostFrequentMood: null,
      moodValue: null,
    };
  }

  // Find most frequent mood
  let mostFrequentMood: number | null = null;
  let maxCount = 0;

  moodCounts.forEach((count, mood) => {
    if (count > maxCount) {
      maxCount = count;
      mostFrequentMood = mood;
    }
  });

  return {
    mostFrequentMood: getMoodLabel(mostFrequentMood),
    moodValue: mostFrequentMood,
  };
};

/**
 * Calculate streak data for a given range
 * A day counts as "active" if it has at least one timeslice with an activity
 * Future dates are excluded from calculations and marked as null
 */
export const calculateStreakData = (
  timeslices: Timeslice[],
  startDate: Date,
  endDate: Date,
): StreakData => {
  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate number of days in range
  const daysDiff = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const daysInRange = Math.max(1, daysDiff + 1);

  // Track which days have at least one timeslice with an activity
  const activeDaysSet = new Set<string>();

  timeslices.forEach((ts) => {
    if (!ts.activity_id || !ts.start_time) return;

    const tsDate = new Date(ts.start_time);
    tsDate.setHours(0, 0, 0, 0);

    // Only count timeslices that are not in the future
    if (tsDate <= today) {
      const dayKey = tsDate.toISOString().split("T")[0]; // YYYY-MM-DD
      activeDaysSet.add(dayKey);
    }
  });

  // Create boolean array for each day in range
  // A day is active if it has at least one timeslice and is not in the future
  const activeDays: boolean[] = [];
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastNonFutureIndex = -1;

  for (let i = 0; i < daysInRange; i++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(checkDate.getDate() + i);
    checkDate.setHours(0, 0, 0, 0);

    // Check if this day is in the future
    const isFuture = checkDate > today;

    if (isFuture) {
      // Mark future days as false (they shouldn't count as active or break streaks)
      activeDays.push(false);
    } else {
      lastNonFutureIndex = i;
      const dayKey = checkDate.toISOString().split("T")[0];
      const isActive = activeDaysSet.has(dayKey);
      activeDays.push(isActive);

      if (isActive) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    }
  }

  // Calculate current streak from the last non-future day backwards
  for (let i = lastNonFutureIndex; i >= 0; i--) {
    if (activeDays[i]) {
      currentStreak++;
    } else {
      break;
    }
  }

  return {
    currentStreak,
    longestStreak,
    activeDays,
    startDate: new Date(startDate), // Include the start date for calendar alignment
  };
};

/**
 * Calculate most frequent activity based on occurrence count
 */
export const calculateMostFrequentActivity = (
  timeslices: Timeslice[],
  activities: Activity[],
): ActivityInsight | null => {
  const activityCounts = new Map<string, number>();

  timeslices.forEach((ts) => {
    if (!ts.activity_id) return;

    const currentCount = activityCounts.get(ts.activity_id) || 0;
    activityCounts.set(ts.activity_id, currentCount + 1);
  });

  if (activityCounts.size === 0) return null;

  let mostFrequentActivityId: string | null = null;
  let maxCount = 0;

  activityCounts.forEach((count, activityId) => {
    if (count > maxCount) {
      maxCount = count;
      mostFrequentActivityId = activityId;
    }
  });

  if (!mostFrequentActivityId) return null;

  const activity = activities.find((a) => a.id === mostFrequentActivityId);
  if (!activity) return null;

  // Calculate total minutes for this activity
  const totalMinutes = timeslices
    .filter((ts) => ts.activity_id === mostFrequentActivityId)
    .reduce((sum, ts) => {
      if (!ts.start_time || !ts.end_time) return sum;
      const startMs = Date.parse(String(ts.start_time));
      const endMs = Date.parse(String(ts.end_time));
      if (Number.isNaN(startMs) || Number.isNaN(endMs)) return sum;
      return sum + (endMs - startMs) / (1000 * 60);
    }, 0);

  return {
    activityId: mostFrequentActivityId,
    activityName: activity.name,
    totalMinutes: Math.round(totalMinutes),
    color: activity.color,
  };
};

/**
 * Generate weekly insights for a given date range
 */
export const generateWeeklyInsights = async (
  startDate: Date,
  endDate: Date,
  allTimeslices?: Timeslice[], // All timeslices for streak calculations
): Promise<WeeklyInsights> => {
  // Fetch timeslices for the date range
  const timeslices = await useTimeslicesStore.getState().getTimeslicesFromTo(startDate, endDate);

  // Extract all unique IDs referenced by the timeslices
  const activitiesIds = Array.from(
    new Set(
      timeslices.map((ts) => ts.activity_id).filter((id): id is string => !!id),
    ),
  );
  const notesIds = Array.from(
    new Set(
      timeslices
        .flatMap((ts) => ts.note_ids?.filter((id: any): id is string => !!id) || [])
        .filter((id): id is string => !!id),
    ),
  );
  const statesIds = Array.from(
    new Set(
      timeslices.map((ts) => ts.state_id).filter((id): id is string => !!id),
    ),
  );

  // Fetch all referenced data in parallel
  const [activities, notes, states] = await Promise.all([
    useActivitiesStore.getState().getActivities(activitiesIds),
    useNotesStore.getState().getNotes(notesIds),
    useStatesStore.getState().getStates(statesIds),
  ]);

  const { mostTime, leastTime } = calculateActivityInsights(
    timeslices,
    activities,
  );
  const noteStats = calculateNoteInsights(timeslices, notes);
  const moodStats = calculateMoodInsights(timeslices, states);
  const mostFrequentActivity = calculateMostFrequentActivity(
    timeslices,
    activities,
  );

  // Use all timeslices for streak calculations, fallback to filtered if not provided
  const timeslicesForStreaks = allTimeslices || timeslices;

  // Calculate weekly streak for ongoing week (Monday to Sunday)
  const now = new Date();
  const currentDayOfWeek = now.getDay();
  const daysSinceMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - daysSinceMonday);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6); // Sunday
  weekEnd.setHours(23, 59, 59, 999);

  const weeklyStreak = calculateStreakData(
    timeslicesForStreaks,
    weekStart,
    weekEnd,
  );

  // Calculate monthly streak for current month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  monthStart.setHours(0, 0, 0, 0);

  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  monthEnd.setHours(23, 59, 59, 999);

  const monthlyStreak = calculateStreakData(
    timeslicesForStreaks,
    monthStart,
    monthEnd,
  );

  return {
    mostTimeActivity: mostTime,
    leastTimeActivity: leastTime,
    noteStats,
    moodStats,
    mostFrequentActivity,
    weeklyStreak,
    monthlyStreak,
  };
};
