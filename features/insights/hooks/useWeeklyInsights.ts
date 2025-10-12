import { useEffect, useState, useMemo } from "react";
import { WeeklyInsights } from "../types/insights";
import { generateWeeklyInsights } from "../services/insightsService";
import useTimeslicesStore from "@/shared/stores/resources/useTimeslicesStore";

/**
 * Hook to calculate weekly insights based on the current week
 * Week starts on Monday and uses local timezone
 * Automatically calculates insights for the ongoing week
 */
export const useWeeklyInsights = (): {
  insights: WeeklyInsights | null;
  loading: boolean;
  error: Error | null;
} => {
  const [insights, setInsights] = useState<WeeklyInsights | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Get all timeslices for streak calculations
  const allTimeslices = useTimeslicesStore((s) => s.timeslices);

  // Calculate date range for current week (Monday to Sunday)
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();

    // Get the current day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayOfWeek = now.getDay();

    // Calculate days since Monday (treat Sunday as 6 days after Monday)
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    // Start of week (Monday at 00:00:00)
    const start = new Date(now);
    start.setDate(start.getDate() - daysSinceMonday);
    start.setHours(0, 0, 0, 0);

    // End of week (Sunday at 23:59:59)
    const end = new Date(start);
    end.setDate(end.getDate() + 6); // Add 6 days to get to Sunday
    end.setHours(23, 59, 59, 999);

    return { startDate: start, endDate: end };
  }, []);

  // Fetch and calculate insights whenever date range changes
  useEffect(() => {
    let cancelled = false;

    const fetchInsights = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await generateWeeklyInsights(
          startDate,
          endDate,
          allTimeslices // Pass all timeslices for streak calculations
        );

        if (!cancelled) {
          setInsights(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to fetch insights"));
          setInsights(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchInsights();

    return () => {
      cancelled = true;
    };
  }, [startDate, endDate, allTimeslices]);

  return { insights, loading, error };
};
