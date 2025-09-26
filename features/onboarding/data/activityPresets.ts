import type { Activity } from "@/shared/types/models/activity";

export interface ActivityPreset {
  id: string;
  name: string;
  nameKey: string; // i18n key
  categoryKey: string; // Category key to match with database category.key
  color: string;
  weight: number;
  status: "ENABLED" | "DISABLED" | "DELETED";
}

export const ACTIVITY_PRESETS: ActivityPreset[] = [
  // Work-related activities
  {
    id: "work",
    name: "Work",
    nameKey: "onboarding.activities.work",
    categoryKey: "work",
    color: "#3B82F6",
    weight: 0.5,
    status: "ENABLED",
  },
  {
    id: "admin",
    name: "Admin",
    nameKey: "onboarding.activities.admin",
    categoryKey: "work",
    color: "#1E40AF",
    weight: 0.3,
    status: "ENABLED",
  },
  {
    id: "email",
    name: "Email",
    nameKey: "onboarding.activities.email",
    categoryKey: "work",
    color: "#2563EB",
    weight: 0.2,
    status: "ENABLED",
  },
  {
    id: "meetings",
    name: "Meetings",
    nameKey: "onboarding.activities.meetings",
    categoryKey: "work",
    color: "#3730A3",
    weight: 0.2,
    status: "ENABLED",
  },
  {
    id: "planning",
    name: "Planning",
    nameKey: "onboarding.activities.planning",
    categoryKey: "work",
    color: "#1D4ED8",
    weight: 0.4,
    status: "ENABLED",
  },

  // Social activities
  {
    id: "family-time",
    name: "Family Time",
    nameKey: "onboarding.activities.family-time",
    categoryKey: "social",
    color: "#8B5CF6",
    weight: 0.9,
    status: "ENABLED",
  },
  {
    id: "caregiving",
    name: "Caregiving",
    nameKey: "onboarding.activities.caregiving",
    categoryKey: "social",
    color: "#7C3AED",
    weight: 0.8,
    status: "ENABLED",
  },
  {
    id: "friends",
    name: "Friends",
    nameKey: "onboarding.activities.friends",
    categoryKey: "social",
    color: "#A855F7",
    weight: 0.8,
    status: "ENABLED",
  },

  // Health activities
  {
    id: "sleep",
    name: "Sleep",
    nameKey: "onboarding.activities.sleep",
    categoryKey: "health",
    color: "#6366F1",
    weight: 1,
    status: "ENABLED",
  },
  {
    id: "exercise",
    name: "Exercise",
    nameKey: "onboarding.activities.exercise",
    categoryKey: "health",
    color: "#EF4444",
    weight: 1,
    status: "ENABLED",
  },
  {
    id: "meditation",
    name: "Meditation",
    nameKey: "onboarding.activities.meditation",
    categoryKey: "health",
    color: "#06B6D4",
    weight: 1,
    status: "ENABLED",
  },
  {
    id: "health",
    name: "Health",
    nameKey: "onboarding.activities.health",
    categoryKey: "health",
    color: "#10B981",
    weight: 1,
    status: "ENABLED",
  },

  // Food activities
  {
    id: "meal",
    name: "Meal",
    nameKey: "onboarding.activities.meal",
    categoryKey: "food",
    color: "#F59E0B",
    weight: 0.7,
    status: "ENABLED",
  },
  {
    id: "cooking",
    name: "Cooking",
    nameKey: "onboarding.activities.cooking",
    categoryKey: "food",
    color: "#D97706",
    weight: 0.8,
    status: "ENABLED",
  },

  // Home activities
  {
    id: "chores",
    name: "Chores",
    nameKey: "onboarding.activities.chores",
    categoryKey: "home",
    color: "#65A30D",
    weight: 0.4,
    status: "ENABLED",
  },
  {
    id: "groceries",
    name: "Groceries",
    nameKey: "onboarding.activities.groceries",
    categoryKey: "home",
    color: "#84CC16",
    weight: 0.5,
    status: "ENABLED",
  },
  {
    id: "home-admin",
    name: "Home Admin",
    nameKey: "onboarding.activities.home-admin",
    categoryKey: "home",
    color: "#16A34A",
    weight: 0.3,
    status: "ENABLED",
  },

  // Learning activities
  {
    id: "learning",
    name: "Learning",
    nameKey: "onboarding.activities.learning",
    categoryKey: "learn",
    color: "#059669",
    weight: 0.9,
    status: "ENABLED",
  },
  {
    id: "reading",
    name: "Reading",
    nameKey: "onboarding.activities.reading",
    categoryKey: "learn",
    color: "#10B981",
    weight: 0.8,
    status: "ENABLED",
  },
  {
    id: "creative-work",
    name: "Creative Work",
    nameKey: "onboarding.activities.creative-work",
    categoryKey: "learn",
    color: "#047857",
    weight: 0.9,
    status: "ENABLED",
  },

  // Play activities
  {
    id: "hobby",
    name: "Hobby",
    nameKey: "onboarding.activities.hobby",
    categoryKey: "play",
    color: "#EC4899",
    weight: 0.7,
    status: "ENABLED",
  },
  {
    id: "relax",
    name: "Relax",
    nameKey: "onboarding.activities.relax",
    categoryKey: "play",
    color: "#DB2777",
    weight: 0.6,
    status: "ENABLED",
  },
  {
    id: "tv",
    name: "TV",
    nameKey: "onboarding.activities.tv",
    categoryKey: "play",
    color: "#BE185D",
    weight: 0,
    status: "ENABLED",
  },
  {
    id: "doomscrolling",
    name: "Doomscrolling",
    nameKey: "onboarding.activities.doomscrolling",
    categoryKey: "play",
    color: "#9D174D",
    weight: 0,
    status: "ENABLED",
  },

  // Travel activities
  {
    id: "nature",
    name: "Nature",
    nameKey: "onboarding.activities.nature",
    categoryKey: "travel",
    color: "#F97316",
    weight: 0.8,
    status: "ENABLED",
  },
  {
    id: "walking",
    name: "Walking",
    nameKey: "onboarding.activities.walking",
    categoryKey: "travel",
    color: "#EA580C",
    weight: 0.9,
    status: "ENABLED",
  },
  {
    id: "commute",
    name: "Commute",
    nameKey: "onboarding.activities.commute",
    categoryKey: "travel",
    color: "#DC2626",
    weight: 0.2,
    status: "ENABLED",
  },

  // Rest activities
  {
    id: "reflection",
    name: "Reflection",
    nameKey: "onboarding.activities.reflection",
    categoryKey: "rest",
    color: "#6B7280",
    weight: 1,
    status: "ENABLED",
  },
];

/**
 * Converts a preset activity to a format suitable for database insertion
 * @param preset - Activity preset to convert
 * @param userId - ID of the current user
 * @param localizedName - Localized name for the activity
 * @param categoryId - Actual category ID from the database
 * @returns Activity data for database insertion
 */
export function convertPresetToActivity(
  preset: ActivityPreset,
  userId: string,
  localizedName: string,
  categoryId: string,
): Omit<Activity, "id" | "created_at" | "updated_at"> {
  return {
    name: localizedName,
    color: preset.color,
    user_id: userId,
    activity_category_id: categoryId,
    parent_activity_id: null,
    status: preset.status,
    weight: preset.weight,
  };
}
