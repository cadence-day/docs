import { Smiley, SmileyMeh, SmileySad } from "phosphor-react-native";
import React from "react";

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
    case 1:
    case 2:
      return <SmileySad size={size} color={iconColor} weight={weight} />; // Sad/Melancholic
    case 3:
      return <SmileyMeh size={size} color={iconColor} weight={weight} />; // Neutral
    case 4:
    case 5:
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
  if (mood === null || mood === undefined) return null;

  switch (mood) {
    case 1:
      return "Very Sad";
    case 2:
      return "Sad";
    case 3:
      return "Neutral";
    case 4:
      return "Happy";
    case 5:
      return "Very Happy";
    default:
      return null;
  }
};

/**
 * Gets a simple emoji representation of the mood
 * @param mood - The mood value (1-5) or null
 * @returns Emoji string or null
 */
export const getMoodEmoji = (mood: number | null): string | null => {
  if (mood === null || mood === undefined) return null;

  switch (mood) {
    case 1:
    case 2:
      return "😢"; // Sad/Melancholic
    case 3:
      return "😐"; // Neutral
    case 4:
    case 5:
      return "😊"; // Content/Happy
    default:
      return null;
  }
};
