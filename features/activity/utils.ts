import type { Activity } from "@/shared/types/models/activity";
import { ACTIVITY_COLOR_PALETTE, WEIGHT_CONFIG } from "./constants";

// Re-export grid utilities for backwards compatibility
export {
  calculateGridProperties,
  createDefaultGridConfig,
} from "./components/utils/gridUtils";

// NOTE: calculateGridItemWidth removed as it was unused; use createDefaultGridConfig + calculateGridProperties instead when needed.

// Filter activities by status
export const filterActivitiesByStatus = (
  activities: Activity[],
  status: "ENABLED" | "DISABLED" | "DELETED"
): Activity[] => {
  return activities.filter((activity) => activity.status === status);
};

// Sort activities by weight and name
export const sortActivities = (activities: Activity[]): Activity[] => {
  return [...activities].sort((a, b) => {
    // Sort by weight first (descending), then by name (ascending)
    if (a.weight !== b.weight) {
      return (b.weight || 0) - (a.weight || 0);
    }
    return (a.name || "").localeCompare(b.name || "");
  });
};

// Group activities by category
export const groupActivitiesByCategory = (
  activities: Activity[]
): Record<string, Activity[]> => {
  return activities.reduce(
    (groups, activity) => {
      const categoryId = activity.activity_category_id || "uncategorized";
      if (!groups[categoryId]) {
        groups[categoryId] = [];
      }
      groups[categoryId].push(activity);
      return groups;
    },
    {} as Record<string, Activity[]>
  );
};

// Find activity by ID
export const findActivityById = (
  activities: Activity[],
  id: string
): Activity | undefined => {
  return activities.find((activity) => activity.id === id);
};

// Enhanced activity validation with weight constants
export const validateActivity = (activity: Partial<Activity>): string[] => {
  const errors: string[] = [];

  if (!activity.name?.trim()) {
    errors.push("Activity name is required");
  }

  if (!activity.activity_category_id) {
    errors.push("Activity category is required");
  }

  if (activity.weight !== undefined) {
    const weight = Number(activity.weight);
    if (
      isNaN(weight) ||
      weight < WEIGHT_CONFIG.MIN ||
      weight > WEIGHT_CONFIG.MAX
    ) {
      errors.push(
        `Weight must be a number between ${WEIGHT_CONFIG.MIN} and ${WEIGHT_CONFIG.MAX}`
      );
    }
  }

  return errors;
};

// Color utilities for activities
export const getContrastTextColor = (backgroundColor: string): string => {
  // Simple contrast calculation - could be improved
  const hex = backgroundColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#FFFFFF";
};

// Generate a random color using centralized palette
export const generateRandomColor = (): string => {
  return ACTIVITY_COLOR_PALETTE[
    Math.floor(Math.random() * ACTIVITY_COLOR_PALETTE.length)
  ];
};

// Get weight description based on centralized config
export const getWeightDescription = (weight: number): string => {
  const { DESCRIPTIONS } = WEIGHT_CONFIG;

  if (
    weight >= DESCRIPTIONS.VERY_LAID_BACK[0] &&
    weight <= DESCRIPTIONS.VERY_LAID_BACK[1]
  ) {
    return "very-laid-back";
  }
  if (
    weight >= DESCRIPTIONS.SOMEWHAT_RELAXED[0] &&
    weight <= DESCRIPTIONS.SOMEWHAT_RELAXED[1]
  ) {
    return "somewhat-relaxed";
  }
  if (DESCRIPTIONS.BALANCED.some((w) => w === weight)) {
    return "balanced";
  }
  if (
    weight >= DESCRIPTIONS.SOMEWHAT_ENERGETIC[0] &&
    weight <= DESCRIPTIONS.SOMEWHAT_ENERGETIC[1]
  ) {
    return "somewhat-energetic";
  }
  if (
    weight >= DESCRIPTIONS.ENERGETIC[0] &&
    weight <= DESCRIPTIONS.ENERGETIC[1]
  ) {
    return "energetic";
  }
  if (DESCRIPTIONS.HIGHLY_ENERGETIC.some((w) => w === weight)) {
    return "highly-energetic";
  }

  return "balanced"; // fallback
};
