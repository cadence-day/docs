import useActivitiesStore from "@/shared/stores/resources/useActivitiesStore";
import useTimeslicesStore from "@/shared/stores/resources/useTimeslicesStore";
import { tool } from "ai";
import { format, parseISO } from "date-fns";
import { z } from "zod";

export const getTimeslicesForDateTool = tool({
  description:
    "Get timeslices for a specific date or date range. Returns all time tracking data with activity names, states, and notes for the requested period. This tool automatically enriches timeslices with activity information.",
  inputSchema: z.object({
    startDate: z.string().describe("Start date in ISO format (YYYY-MM-DD)"),
    endDate: z.string().optional().describe(
      "End date in ISO format (YYYY-MM-DD). If not provided, only the start date will be used.",
    ),
  }),
  execute: async ({ startDate, endDate }) => {
    try {
      const timesliceStore = useTimeslicesStore.getState();
      const activityStore = useActivitiesStore.getState();

      const startUtc = parseISO(startDate);
      const endUtc = endDate ? parseISO(endDate) : startUtc;

      // Set end date to end of day
      endUtc.setHours(23, 59, 59, 999);

      const timeslices = await timesliceStore.getTimeslicesFromTo(
        startUtc,
        endUtc,
      );

      if (!timeslices || timeslices.length === 0) {
        return {
          success: false,
          message: `No timeslices found for the date range ${startDate}${
            endDate ? ` to ${endDate}` : ""
          }`,
          data: [],
        };
      }

      // Get all activities to enrich timeslices
      const activities = activityStore.activities;
      const activityMap = new Map(activities.map((a) => [a.id, a]));

      return {
        success: true,
        message: `Found ${timeslices.length} timeslice${
          timeslices.length !== 1 ? "s" : ""
        } for ${startDate}${endDate ? ` to ${endDate}` : ""}`,
        data: timeslices.map((ts) => {
          const activity = activityMap.get(ts.activity_id);
          return {
            id: ts.id,
            startTime: format(
              new Date(ts.start_time_utc),
              "yyyy-MM-dd HH:mm:ss",
            ),
            endTime: ts.end_time_utc
              ? format(new Date(ts.end_time_utc), "yyyy-MM-dd HH:mm:ss")
              : null,
            activityId: ts.activity_id,
            activityName: activity?.name || "Unknown Activity",
            activityColor: activity?.color,
            activityIcon: activity?.icon,
            stateId: ts.state_id,
            noteIds: ts.note_ids,
            duration: ts.duration,
          };
        }),
      };
    } catch (error) {
      return {
        success: false,
        message: `Error fetching timeslices: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        data: [],
      };
    }
  },
});
