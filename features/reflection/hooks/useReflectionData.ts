import { useI18n } from "@/shared/hooks/useI18n";
import {
  useActivitiesStore,
  useNotesStore,
  useStatesStore,
  useTimeslicesStore,
} from "@/shared/stores";
import { Timeslice } from "@/shared/types/models";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { useUser } from "@clerk/clerk-expo";
import { useCallback, useEffect, useMemo, useState } from "react";
import { timeslicesParser } from "../utils";

export interface UseReflectionDataReturn {
  timeslices: Timeslice[];
  parsedTimeslices: Record<string, Record<string, Timeslice | null>>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getDateRange: () => {
    from: Date;
    to: Date;
    formattedRange: string;
    totalDays: number;
  };
  dataCompleteness: {
    hasTimeslices: boolean;
    hasActivities: boolean;
    hasStates: boolean;
  };
}

export function useReflectionData(
  fromDate: Date,
  toDate: Date
): UseReflectionDataReturn {
  // Use Clerk's React hook to obtain the current user in a testable, react-friendly way
  const { user, isSignedIn } = useUser();
  const timeslicesStore = useTimeslicesStore();
  const activitiesStore = useActivitiesStore();
  const statesStore = useStatesStore();
  const { getCurrentLanguage } = useI18n();

  // Memoize the locale to prevent infinite re-renders
  const currentLocale = useMemo(
    () => getCurrentLanguage(),
    [getCurrentLanguage]
  );

  const [timeslices, setTimeslices] = useState<Timeslice[]>([]);
  const [parsedTimeslices, setParsedTimeslices] = useState<
    Record<string, Record<string, Timeslice | null>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refetch function using timeline refresh pattern
  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      GlobalErrorHandler.logDebug(
        "Starting refetch for date range",
        "useReflectionData",
        {
          fromDate: fromDate.toLocaleDateString(),
          toDate: toDate.toLocaleDateString(),
        }
      );

      // Get store state and API methods directly (like timeline refresh)
      const timeslicesStoreState = useTimeslicesStore.getState();
      const activitiesStoreState = useActivitiesStore.getState();
      const statesStoreState = useStatesStore.getState();
      const notesStoreState = useNotesStore.getState();

      // Get current user ID from Clerk's `useUser` hook
      const currentUserId = user?.id;
      const sessionStatus = isSignedIn ? "active" : "inactive";

      if (!currentUserId || sessionStatus !== "active") {
        throw new Error(
          "User must be authenticated with an active session to fetch reflection data"
        );
      }

      // Fetch data in parallel using the same pattern as timeline refresh
      const [timeslicesResult, activitiesResult, statesResult, notesResult] =
        await Promise.allSettled([
          timeslicesStoreState.getTimeslicesFromTo(fromDate, toDate),
          activitiesStoreState.getAllActivities(),
          statesStoreState.getAllStates(),
          notesStoreState.getUserNotes(currentUserId),
        ]);

      GlobalErrorHandler.logDebug("Fetch results", "useReflectionData", {
        timeslicesStatus: timeslicesResult.status,
        activitiesStatus: activitiesResult.status,
        statesStatus: statesResult.status,
        dateRange: `${fromDate.toISOString()} - ${toDate.toISOString()}`,
      });

      // Handle timeslices result (main data)
      if (timeslicesResult.status === "fulfilled" && timeslicesResult.value) {
        const fetchedTimeslices = timeslicesResult.value;

        GlobalErrorHandler.logDebug(
          `Fetched ${fetchedTimeslices.length} timeslices`,
          "useReflectionData"
        );

        // Update the store directly with fresh data (timeline refresh pattern)
        if (fetchedTimeslices.length > 0) {
          useTimeslicesStore.setState((state) => {
            // Remove existing timeslices in the date range
            const filteredTimeslices = state.timeslices.filter((ts) => {
              if (!ts.start_time) return true;
              const tsDate = new Date(ts.start_time);
              return tsDate < fromDate || tsDate > toDate;
            });

            // Add fresh timeslices
            return {
              timeslices: [...filteredTimeslices, ...fetchedTimeslices],
            };
          });
        }
      } else if (timeslicesResult.status === "rejected") {
        GlobalErrorHandler.logWarning(
          "Failed to refetch timeslices",
          "useReflectionData",
          {
            reason: timeslicesResult.reason,
            fromDate: fromDate.toISOString(),
            toDate: toDate.toISOString(),
          }
        );
        GlobalErrorHandler.logError(
          timeslicesResult.reason,
          "useReflectionData.refetch.timeslices",
          {
            fromDate: fromDate.toISOString(),
            toDate: toDate.toISOString(),
          }
        );
        setError(
          timeslicesResult.reason instanceof Error
            ? timeslicesResult.reason.message
            : "Failed to refetch timeslices"
        );
      }

      // Handle activities result - update the activities store
      if (activitiesResult.status === "fulfilled" && activitiesResult.value) {
        const fetchedActivities = activitiesResult.value;
        GlobalErrorHandler.logDebug(
          `Fetched ${fetchedActivities.length} activities`,
          "useReflectionData"
        );

        // Update activities store with fresh data
        if (fetchedActivities.length > 0) {
          useActivitiesStore.setState((state) => {
            const enabledActivities = fetchedActivities.filter(
              (a) => a.status === "ENABLED"
            );
            const disabledActivities = fetchedActivities.filter(
              (a) => a.status === "DISABLED"
            );
            const deletedActivities = fetchedActivities.filter(
              (a) => a.status === "DELETED"
            );

            return {
              activities: enabledActivities,
              disabledActivities: disabledActivities,
              deletedActivities: deletedActivities,
            };
          });
        }
      } else if (activitiesResult.status === "rejected") {
        GlobalErrorHandler.logWarning(
          "Failed to refetch activities",
          "useReflectionData",
          {
            reason: activitiesResult.reason,
            fromDate: fromDate.toISOString(),
            toDate: toDate.toISOString(),
          }
        );
        GlobalErrorHandler.logError(
          activitiesResult.reason,
          "useReflectionData.refetch.activities",
          {
            fromDate: fromDate.toISOString(),
            toDate: toDate.toISOString(),
          }
        );
      }

      // Handle states result - update the states store
      if (statesResult.status === "fulfilled" && statesResult.value) {
        const fetchedStates = statesResult.value;
        GlobalErrorHandler.logDebug(
          `Fetched ${fetchedStates.length} states`,
          "useReflectionData"
        );

        // Update states store with fresh data
        if (fetchedStates.length > 0) {
          useStatesStore.setState((state) => ({
            states: fetchedStates,
          }));
        }
      } else if (statesResult.status === "rejected") {
        GlobalErrorHandler.logWarning(
          "Failed to refetch states",
          "useReflectionData",
          {
            reason: statesResult.reason,
            fromDate: fromDate.toISOString(),
            toDate: toDate.toISOString(),
          }
        );
        GlobalErrorHandler.logError(
          statesResult.reason,
          "useReflectionData.refetch.states",
          {
            fromDate: fromDate.toISOString(),
            toDate: toDate.toISOString(),
          }
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to refetch reflection data";
      setError(errorMessage);
      GlobalErrorHandler.logError(err, "useReflectionData.refetch", {
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate, user]);

  // Initial fetch when dates change (using refetch logic)
  useEffect(() => {
    let mounted = true;

    const fetchAllReflectionData = async () => {
      if (!mounted) return;
      await refetch();
    };

    fetchAllReflectionData();

    return () => {
      mounted = false;
    };
  }, [fromDate, toDate, refetch]);

  // Effect to sync local timeslices state with store data
  useEffect(() => {
    const allTimeslices = timeslicesStore.timeslices || [];
    const filteredTimeslices = allTimeslices.filter((timeslice) => {
      if (!timeslice.start_time) return false;
      const startTime = new Date(timeslice.start_time);
      // Use more inclusive filtering since each timeslice is 30 minutes
      return startTime >= fromDate && startTime <= toDate;
    });

    GlobalErrorHandler.logDebug("Syncing timeslices", "useReflectionData", {
      allTimeslicesCount: allTimeslices.length,
      filteredCount: filteredTimeslices.length,
      dateRange: `${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}`,
    });

    setTimeslices(filteredTimeslices);
  }, [timeslicesStore.timeslices, fromDate, toDate]);

  // Parse timeslices for reflection display
  useEffect(() => {
    GlobalErrorHandler.logDebug(
      `Parsing ${timeslices.length} timeslices`,
      "useReflectionData"
    );
    const parsed = timeslicesParser(timeslices, currentLocale);
    GlobalErrorHandler.logDebug("Parsed timeslices", "useReflectionData", {
      timeslicesCount: timeslices.length,
      parsedDatesCount: Object.keys(parsed).length,
      sampleParsedKeys: Object.keys(parsed).slice(0, 3),
      locale: currentLocale,
    });
    setParsedTimeslices(parsed);
  }, [timeslices, currentLocale]);

  // Function to get the date range of displayed data
  const getDateRange = useCallback(() => {
    const totalDays =
      Math.ceil(
        (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

    return {
      from: fromDate,
      to: toDate,
      formattedRange: `${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}`,
      totalDays,
    };
  }, [fromDate, toDate]);

  // Memoize the return object to prevent unnecessary re-renders
  const returnValue = useMemo(
    () => ({
      timeslices,
      parsedTimeslices,
      isLoading,
      error,
      refetch,
      getDateRange,
      dataCompleteness: {
        hasTimeslices: timeslicesStore.timeslices.length > 0,
        hasActivities: activitiesStore.activities.length > 0,
        hasStates: statesStore.states.length > 0,
      },
    }),
    [
      timeslices,
      parsedTimeslices,
      isLoading,
      error,
      refetch,
      getDateRange,
      timeslicesStore.timeslices.length,
      activitiesStore.activities.length,
      statesStore.states.length,
    ]
  );

  return returnValue;
}
