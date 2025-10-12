import { Smiley, SmileyMeh, SmileySad } from "phosphor-react-native";
import React from "react";
import { MOOD_VALUES, getMoodLabel } from "@/shared/constants/Mood";

export interface MoodIconOptions {
  size?: number;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
}

/**
 * Maps mood values to appropriate mood icons
 * @param mood - The mood value (1-5) or null
 * @param iconColor - The color of the icon
 * @param options - Optional styling options for the icon
 * @returns JSX element or null
 */
export const getMoodIcon = (
  mood: number | null,
  iconColor: string,
  options: MoodIconOptions = {}
): React.JSX.Element | null => {
  const { size = 20, weight = "regular" } = options;

  if (mood === null || mood === undefined) return null;

  switch (mood) {
    case MOOD_VALUES.SAD:
    case MOOD_VALUES.MELANCHOLIC:
      return <SmileySad size={size} color={iconColor} weight={weight} />; // Sad/Melancholic
    case MOOD_VALUES.NEUTRAL:
      return <SmileyMeh size={size} color={iconColor} weight={weight} />; // Neutral
    case MOOD_VALUES.CONTENT:
    case MOOD_VALUES.HAPPY:
      return <Smiley size={size} color={iconColor} weight={weight} />; // Content/Happy
    default:
      return null;
  }
};

/**
 * Gets a text representation of the mood
 * @param mood - The mood value (1-5) or null
 * @returns String representation of mood
 */
export const getMoodText = (mood: number | null): string | null => {
  return getMoodLabel(mood);
};

/**
 * Gets a simple emoji representation of the mood
 * @param mood - The mood value (1-5) or null
 * @returns Emoji string or null
 */
export const getMoodEmoji = (mood: number | null): string | null => {
  if (mood === null || mood === undefined) return null;

  switch (mood) {
    case MOOD_VALUES.SAD:
    case MOOD_VALUES.MELANCHOLIC:
      return "😢"; // Sad/Melancholic
    case MOOD_VALUES.NEUTRAL:
      return "😐"; // Neutral
    case MOOD_VALUES.CONTENT:
    case MOOD_VALUES.HAPPY:
      return "😊"; // Content/Happy
    default:
      return null;
  }
};
