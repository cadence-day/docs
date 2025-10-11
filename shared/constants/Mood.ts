/**
 * Mood constants and labels for the Cadence.day app
 *
 * Mood values range from 1 (Sad) to 5 (Happy)
 * These constants are used throughout the app for mood tracking and display
 */

/**
 * Mood value constants
 */
export const MOOD_VALUES = {
  SAD: 1,
  MELANCHOLIC: 2,
  NEUTRAL: 3,
  CONTENT: 4,
  HAPPY: 5,
} as const;

/**
 * Mood labels mapped by numeric value
 * Used for displaying mood in text format
 */
export const MOOD_LABELS: Record<number, string> = {
  [MOOD_VALUES.SAD]: "Sad",
  [MOOD_VALUES.MELANCHOLIC]: "Melancholic",
  [MOOD_VALUES.NEUTRAL]: "Neutral",
  [MOOD_VALUES.CONTENT]: "Content",
  [MOOD_VALUES.HAPPY]: "Happy",
} as const;

/**
 * Mood label i18n keys mapped by numeric value
 * Used for localized mood display
 */
export const MOOD_LABEL_KEYS: Record<number, string> = {
  [MOOD_VALUES.SAD]: "mood-labels.sad",
  [MOOD_VALUES.MELANCHOLIC]: "mood-labels.melancholic",
  [MOOD_VALUES.NEUTRAL]: "mood-labels.neutral",
  [MOOD_VALUES.CONTENT]: "mood-labels.content",
  [MOOD_VALUES.HAPPY]: "mood-labels.happy",
} as const;

/**
 * Array of mood label i18n keys in order (1-5)
 */
export const MOOD_LABEL_KEYS_ARRAY = [
  "mood-labels.sad",
  "mood-labels.melancholic",
  "mood-labels.neutral",
  "mood-labels.content",
  "mood-labels.happy",
] as const;

/**
 * Get mood label for a given mood value
 * @param mood - The mood value (1-5) or null
 * @returns String representation of mood or null
 */
export const getMoodLabel = (mood: number | null): string | null => {
  if (mood === null || mood === undefined) return null;
  return MOOD_LABELS[mood] || null;
};

/**
 * Get mood label i18n key for a given mood value
 * @param mood - The mood value (1-5) or null
 * @returns i18n key for mood or null
 */
export const getMoodLabelKey = (mood: number | null): string | null => {
  if (mood === null || mood === undefined) return null;
  return MOOD_LABEL_KEYS[mood] || null;
};

/**
 * Mood value type for type safety
 */
export type MoodValue = typeof MOOD_VALUES[keyof typeof MOOD_VALUES];
