import { tool } from "ai";
import { format } from "date-fns";
import { z } from "zod";

export const getCurrentDateTool = tool({
    description:
        "Get the current date and time. Use this when the user asks about today, now, or current time. Returns the current date in ISO format along with formatted versions.",
    inputSchema: z.object({
        includeTime: z.boolean().optional().describe(
            "Whether to include the time in the response. Defaults to true.",
        ),
        timezone: z.string().optional().describe(
            "Timezone for the date (e.g., 'America/New_York'). Defaults to user's local timezone.",
        ),
    }),
    execute: async ({ includeTime = true, timezone }) => {
        try {
            const now = new Date();

            return {
                success: true,
                message: "Current date and time retrieved successfully",
                data: {
                    iso: now.toISOString(),
                    date: format(now, "yyyy-MM-dd"),
                    time: includeTime ? format(now, "HH:mm:ss") : undefined,
                    dateTime: includeTime
                        ? format(now, "yyyy-MM-dd HH:mm:ss")
                        : format(now, "yyyy-MM-dd"),
                    dayOfWeek: format(now, "EEEE"),
                    formatted: includeTime
                        ? format(now, "EEEE, MMMM do, yyyy 'at' h:mm a")
                        : format(now, "EEEE, MMMM do, yyyy"),
                    timestamp: now.getTime(),
                    timezone: timezone ||
                        Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
            };
        } catch (error) {
            return {
                success: false,
                message: `Error getting current date: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
                data: null,
            };
        }
    },
});
