/**
 * Types for insights data
 */

export interface ActivityInsight {
  activityId: string;
  activityName: string;
  totalMinutes: number;
  color: string;
}

export interface NoteInsight {
  totalNotes: number;
  totalWords: number;
}

export interface MoodInsight {
  mostFrequentMood: string | null;
  moodValue: number | null;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  activeDays: boolean[]; // Array of 7 days for weekly, or 31 for monthly
  startDate: Date; // The start date of the streak period
}

export interface WeeklyInsights {
  // Activity insights
  mostTimeActivity: ActivityInsight | null;
  leastTimeActivity: ActivityInsight | null;

  // Note insights
  noteStats: NoteInsight;

  // Mood insights
  moodStats: MoodInsight;
  mostFrequentActivity: ActivityInsight | null;

  // Streak data
  weeklyStreak: StreakData;
  monthlyStreak: StreakData;
}

export interface InsightsDateRange {
  startDate: Date;
  endDate: Date;
}
