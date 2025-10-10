import useActivitiesStore from "@/shared/stores/resources/useActivitiesStore";
import { tool } from "ai";
import { z } from "zod";

export const getActivitiesTool = tool({
  description:
    "Get all user activities. Returns a list of all activities the user has configured, including their names, colors, categories, and status.",
  inputSchema: z.object({
    includeDisabled: z.boolean().optional().describe(
      "Whether to include disabled activities. Defaults to false.",
    ),
  }),
  execute: async ({ includeDisabled = false }) => {
    try {
      const store = useActivitiesStore.getState();

      const activities = store.activities;
      const disabledActivities = includeDisabled
        ? store.disabledActivities
        : [];

      const allActivities = [...activities, ...disabledActivities];

      if (allActivities.length === 0) {
        return {
          success: false,
          message: "No activities found",
          data: [],
        };
      }

      return {
        success: true,
        message: `Found ${allActivities.length} activit${
          allActivities.length !== 1 ? "ies" : "y"
        }`,
        data: allActivities.map((activity) => ({
          id: activity.id,
          name: activity.name,
          color: activity.color,
          icon: activity.icon,
          categoryId: activity.category_id,
          status: activity.status,
        })),
      };
    } catch (error) {
      return {
        success: false,
        message: `Error fetching activities: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        data: [],
      };
    }
  },
});

export const getActivityByIdTool = tool({
  description: "Get a specific activity by its ID",
  inputSchema: z.object({
    activityId: z.string().describe("The ID of the activity to fetch"),
  }),
  execute: async ({ activityId }) => {
    try {
      const store = useActivitiesStore.getState();
      const activity = await store.getActivity(activityId);

      if (!activity) {
        return {
          success: false,
          message: `Activity with ID ${activityId} not found`,
          data: null,
        };
      }

      return {
        success: true,
        message: `Found activity: ${activity.name}`,
        data: {
          id: activity.id,
          name: activity.name,
          color: activity.color,
          icon: activity.icon,
          categoryId: activity.category_id,
          status: activity.status,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error fetching activity: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        data: null,
      };
    }
  },
});
