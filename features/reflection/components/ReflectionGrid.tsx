import { useProfileStore } from "@/features/profile/stores/useProfileStore";
import { useTheme } from "@/shared/hooks";
import useI18n from "@/shared/hooks/useI18n";
import { useDialogStore } from "@/shared/stores";
import { Timeslice } from "@/shared/types/models";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { useFocusEffect } from "@react-navigation/native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  InteractionManager,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { REFLECTION_LAYOUT } from "../constants/layout";
import { useReflectionData } from "../hooks/useReflectionData";
import { useTimesliceStatistics } from "../hooks/useTimesliceStatistics";
import styles, { reflectionStyles } from "../styles";
import { EmptyReflectionCell, ReflectionCell } from "./ReflectionCell";
import ReflectionDateAxis from "./ReflectionDateAxis";
import ReflectionTimeAxis from "./ReflectionTimeAxis";

// Use shared layout constants for consistent alignment

type ScheduleGridProps = {
  fromDate: Date;
  toDate: Date;
  refreshing: boolean;
  setRefreshing: (refreshing: boolean) => void;
};

// Memoized date column component for better performance
type DateColumnProps = {
  date: { day: string; display: string; full: string };
  dateIndex: number;
  timeSlots: string[];
  parsedTimeslices: Record<string, Record<string, Timeslice | null>>;
  selectedRows: string[];
  isColumnSelected: boolean;
  isolatedActivityId: string | null;
  highlightedTimeslice: Timeslice | null;
  onTimeslicePress: (timeslice: Timeslice) => void;
  onTimesliceLongPress: (timeslice: Timeslice) => void;
  onClearIsolation: () => void;
};

const DateColumn: React.FC<DateColumnProps> = ({
  date,
  dateIndex,
  timeSlots,
  parsedTimeslices,
  selectedRows,
  isColumnSelected,
  isolatedActivityId,
  highlightedTimeslice,
  onTimeslicePress,
  onTimesliceLongPress,
  onClearIsolation,
}) => {
  return (
    <View
      style={[
        reflectionStyles.reflectionGridDateColumn,
        isColumnSelected
          ? reflectionStyles.reflectionGridSelectedDateColumn
          : reflectionStyles.reflectionGridNotSelectedDateColumn,
      ]}
    >
      {timeSlots.map((timeSlot, timeIndex) => {
        const isRowSelected =
          selectedRows.length === 0 || selectedRows.includes(timeSlot);
        const timeslice = parsedTimeslices[date.full]?.[timeSlot];

        // Determine if this cell should be dimmed based on isolation and selection state
        let isDimmed = false;
        let isolationOpacity = 1;

        if (isolatedActivityId) {
          // When an activity is isolated, dim everything except that activity
          const isIsolatedActivity =
            timeslice && timeslice.activity_id === isolatedActivityId;
          isDimmed = !isIsolatedActivity;
          // Use different opacity for isolated vs non-isolated cells
          isolationOpacity = isIsolatedActivity ? 1 : 0.15;
        } else {
          // Normal dimming logic based on row/column selection
          isDimmed = !isColumnSelected || !isRowSelected;
          isolationOpacity = isDimmed ? 0.3 : 1;
        }

        if (timeslice) {
          const isSelectedTimeslice = highlightedTimeslice?.id === timeslice.id;
          return (
            <ReflectionCell
              key={`${dateIndex}-${timeIndex}`}
              timeslice={timeslice}
              onPress={() => onTimeslicePress(timeslice)}
              onLongPress={() => onTimesliceLongPress(timeslice)}
              dimmed={isDimmed}
              notSelectedOpacity={isolationOpacity}
              isSelected={isSelectedTimeslice}
            />
          );
        } else {
          return (
            <EmptyReflectionCell
              key={`${dateIndex}-${timeIndex}`}
              dimmed={isDimmed}
              notSelectedOpacity={isolationOpacity}
              onLongPress={isolatedActivityId ? onClearIsolation : undefined}
            />
          );
        }
      })}
    </View>
  );
};

// Memoize the DateColumn component to prevent unnecessary re-renders
const MemoizedDateColumn = React.memo(DateColumn, (prevProps, nextProps) => {
  return (
    prevProps.date.full === nextProps.date.full &&
    prevProps.isColumnSelected === nextProps.isColumnSelected &&
    prevProps.isolatedActivityId === nextProps.isolatedActivityId &&
    prevProps.selectedRows.length === nextProps.selectedRows.length &&
    prevProps.selectedRows.every(
      (row, index) => row === nextProps.selectedRows[index]
    ) &&
    prevProps.parsedTimeslices[prevProps.date.full] ===
      nextProps.parsedTimeslices[nextProps.date.full] &&
    prevProps.highlightedTimeslice?.id === nextProps.highlightedTimeslice?.id &&
    prevProps.onClearIsolation === nextProps.onClearIsolation
  );
});

const ReflectionGrid: React.FC<ScheduleGridProps> = ({
  fromDate,
  toDate,
  refreshing,
  setRefreshing,
}) => {
  const { t, getCurrentLanguage } = useI18n();
  const theme = useTheme();
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const { parsedTimeslices, isLoading, error, refetch, getDateRange } =
    useReflectionData(fromDate, toDate);
  const [selectedTimeslice, setSelectedTimeslice] = useState<Timeslice | null>(
    null
  );
  // State for activity isolation - when an activity is isolated, only its timeslices are highlighted
  const [isolatedActivityId, setIsolatedActivityId] = useState<string | null>(
    null
  );

  // Track dialog state
  const dialogStore = useDialogStore();
  const isTimesliceDialogOpen = useMemo(() => {
    return Object.values(dialogStore.dialogs).some(
      (dialog) => dialog.type === "reflection-timeslice-info"
    );
  }, [dialogStore.dialogs]);

  // Find current ongoing timeslice based on current time
  const currentTimeslice = useMemo(() => {
    const now = Date.now();
    const today = new Date().toLocaleDateString();

    // Only look for current timeslice in today's data
    const todayTimeslices = parsedTimeslices[today] || {};

    for (const timeSlot of Object.keys(todayTimeslices)) {
      const timeslice = todayTimeslices[timeSlot];
      if (timeslice?.start_time && timeslice?.end_time) {
        const startMs = Date.parse(timeslice.start_time);
        const endMs = Date.parse(timeslice.end_time);

        if (!Number.isNaN(startMs) && !Number.isNaN(endMs)) {
          if (now >= startMs && now < endMs) {
            return timeslice;
          }
        }
      }
    }
    return null;
  }, [parsedTimeslices]);

  // Determine which timeslice should be highlighted
  const highlightedTimeslice = useMemo(() => {
    if (isTimesliceDialogOpen) {
      // When dialog is open, highlight the selected timeslice
      return selectedTimeslice;
    } else {
      // When dialog is off, highlight the current ongoing timeslice
      return currentTimeslice;
    }
  }, [isTimesliceDialogOpen, selectedTimeslice, currentTimeslice]);

  // Clear selected timeslice when dialog closes
  useEffect(() => {
    if (!isTimesliceDialogOpen && selectedTimeslice) {
      setSelectedTimeslice(null);
    }
  }, [isTimesliceDialogOpen, selectedTimeslice]);

  // Statistics hook for enhanced timeslice information
  const { getTimesliceWithDetails } = useTimesliceStatistics(fromDate, toDate);

  // Helper functions for activity isolation
  const isolateActivity = useCallback((activityId: string) => {
    setIsolatedActivityId(activityId);
  }, []);

  const clearActivityIsolation = useCallback(() => {
    setIsolatedActivityId(null);
  }, []);

  // Memoize date range key for dependency tracking
  const dateRangeKey = useMemo(() => {
    return `${fromDate.getTime()}-${toDate.getTime()}`;
  }, [fromDate, toDate]);

  // Memoize parsed timeslices stats for performance tracking
  const timesliceStats = useMemo(() => {
    const totalSlots = Object.values(parsedTimeslices).reduce(
      (total, daySlots) => total + Object.keys(daySlots).length,
      0
    );
    const filledSlots = Object.values(parsedTimeslices).reduce(
      (total, daySlots) =>
        total + Object.values(daySlots).filter((slot) => slot !== null).length,
      0
    );

    return {
      totalDates: Object.keys(parsedTimeslices).length,
      totalSlots,
      filledSlots,
      fillPercentage: totalSlots > 0 ? (filledSlots / totalSlots) * 100 : 0,
    };
  }, [parsedTimeslices]);

  // Debug logging for reflection grid data - optimized with useMemo dependencies
  React.useEffect(() => {
    GlobalErrorHandler.logDebug("Data update", "ReflectionGrid", {
      isLoading,
      error,
      dateRangeKey,
      timesliceStats,
      dateRange: `${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}`,
      sampleParsedDates: Object.keys(parsedTimeslices).slice(0, 3),
    });
  }, [
    isLoading,
    error,
    dateRangeKey,
    timesliceStats,
    fromDate,
    toDate,
    parsedTimeslices,
  ]);

  // Refs for scroll view
  const gridScrollViewRef = useRef<ScrollView>(null);
  const hoursScrollViewRef = useRef<ScrollView>(null);

  // Get wake time from profile settings
  const { settings } = useProfileStore();

  // Calculate dates array for display - optimized with better memoization
  const dates = useMemo(() => {
    const dateArray: { day: string; display: string; full: string }[] = [];
    const currentDate = new Date(fromDate);
    const endDate = new Date(toDate);

    // Normalize dates to avoid timezone issues
    currentDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // Use localized day names from translations
    const dayNames = [
      t("su"), // Sunday
      t("mo"), // Monday
      t("tu"), // Tuesday
      t("we"), // Wednesday
      t("th"), // Thursday
      t("fr"), // Friday
      t("sa"), // Saturday
    ];

    // Use locale-aware date formatting
    const currentLocale = getCurrentLanguage();

    while (currentDate <= endDate) {
      const day = dayNames[currentDate.getDay()];
      const display = currentDate.toLocaleDateString(currentLocale, {
        month: "numeric",
        day: "numeric",
      });
      const full = currentDate.toLocaleDateString(currentLocale);

      dateArray.push({ day, display, full });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
  }, [fromDate, toDate, t, getCurrentLanguage]);

  // Debug log for dates after calculation
  React.useEffect(() => {
    GlobalErrorHandler.logDebug("Generated dates", "ReflectionGrid", {
      generatedDatesCount: dates.length,
      sampleDates: dates
        .slice(0, 3)
        .map((d) => ({ day: d.day, display: d.display, full: d.full })),
      firstDate: dates[0]?.full,
      lastDate: dates[dates.length - 1]?.full,
    });
  }, [dates]);

  // Calculate time slots - memoized but rarely changes
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (
      let hour = REFLECTION_LAYOUT.START_HOUR;
      hour < REFLECTION_LAYOUT.END_HOUR;
      hour++
    ) {
      for (
        let minute = 0;
        minute < 60;
        minute += REFLECTION_LAYOUT.MINUTES_PER_SLOT
      ) {
        slots.push(
          `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        );
      }
    }
    return slots;
  }, []);

  // Memoize grid dimensions for performance optimization
  const gridDimensions = useMemo(
    () => ({
      totalCells: dates.length * timeSlots.length,
      daysCount: dates.length,
      timeSlotsCount: timeSlots.length,
      dateRange: getDateRange(),
    }),
    [dates.length, timeSlots.length, getDateRange]
  );

  // Function to scroll to wake time (similar to Timeline's scrollToIndexAtOneThird)
  const scrollToWakeTime = useCallback(() => {
    if (
      hoursScrollViewRef.current &&
      timeSlots.length > 0 &&
      settings.wakeTime
    ) {
      const wakeTimeIndex = timeSlots.findIndex((slot) => {
        const [wakeHour, wakeMinute] = settings.wakeTime.split(":").map(Number);
        const [slotHour, slotMinute] = slot.split(":").map(Number);

        // Find the closest time slot to wake time
        const wakeTimeMinutes = wakeHour * 60 + wakeMinute;
        const slotTimeMinutes = slotHour * 60 + slotMinute;

        return slotTimeMinutes >= wakeTimeMinutes;
      });

      if (wakeTimeIndex !== -1) {
        // Use InteractionManager similar to Timeline for better timing
        const interactionHandle = InteractionManager.runAfterInteractions(() => {
          // Position wake time at 1/3 of screen height (similar to Timeline)
          const screenHeight = Dimensions.get("window").height;
          const desiredCenterY = screenHeight / 3;

          // Calculate scroll position
          const itemCenter =
            wakeTimeIndex * REFLECTION_LAYOUT.ROW_HEIGHT +
            REFLECTION_LAYOUT.ROW_HEIGHT / 2;
          const targetScrollY = Math.max(0, itemCenter - desiredCenterY);

          // Small delay to ensure component is fully mounted
          setTimeout(() => {
            try {
              hoursScrollViewRef.current?.scrollTo({
                y: targetScrollY,
                animated: true,
              });
            } catch (err) {
              GlobalErrorHandler.logWarning(
                "Failed to scroll to wake time",
                "ReflectionGrid:scrollToWakeTime",
                { error: err }
              );
            }
          }, 50);
        });

        return () => {
          if (
            interactionHandle &&
            typeof interactionHandle.cancel === "function"
          ) {
            try {
              interactionHandle.cancel();
            } catch {}
          }
        };
      }
    }
  }, [timeSlots, settings.wakeTime]);

  // Scroll to wake time when screen gains focus
  useFocusEffect(
    useCallback(() => {
      scrollToWakeTime();
    }, [scrollToWakeTime])
  );

  // Auto-scroll to wake time when component mounts or data changes
  useEffect(() => {
    scrollToWakeTime();
  }, [scrollToWakeTime, parsedTimeslices]); // Re-run when data loads

  // Handle column selection
  const toggleColumn = useCallback((dateString: string) => {
    setSelectedColumns((prev) =>
      prev.includes(dateString)
        ? prev.filter((d) => d !== dateString)
        : [...prev, dateString]
    );
  }, []);

  const resetSelectedColumns = useCallback((dateString: string) => {
    setSelectedColumns([dateString]);
  }, []);

  // Handle row selection
  const toggleRow = useCallback((timeString: string) => {
    setSelectedRows((prev) =>
      prev.includes(timeString)
        ? prev.filter((t) => t !== timeString)
        : [...prev, timeString]
    );
  }, []);

  const resetSelectedRows = useCallback((timeString: string) => {
    setSelectedRows([timeString]);
  }, []);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
      // Clear any activity isolation when refreshing
      clearActivityIsolation();
    } catch (err) {
      GlobalErrorHandler.logError(err, "ReflectionGrid.handleRefresh", {
        dateRangeKey,
      });
    } finally {
      setRefreshing(false);
    }
  }, [refetch, dateRangeKey, setRefreshing, clearActivityIsolation]);

  // Handle timeslice press
  const handleTimeslicePress = useCallback(
    async (timeslice: Timeslice) => {
      try {
        if (!timeslice?.id) return;

        // Set the selected timeslice for highlighting
        setSelectedTimeslice(timeslice);

        // Get enhanced timeslice information with statistics
        const enhancedInfo = await getTimesliceWithDetails(timeslice.id);

        if (enhancedInfo) {
          // Open timeslice info dialog with enhanced information
          useDialogStore.getState().openDialog({
            type: "reflection-timeslice-info",
            props: {
              timesliceInfo: enhancedInfo,
              headerProps: {
                title: "Timeslice Details",
              },
            },
            position: "dock",
          });
        } else {
          GlobalErrorHandler.logError(
            new Error("Failed to get timeslice information"),
            "ReflectionGrid.handleTimeslicePress",
            {
              timesliceId: timeslice?.id,
            }
          );
        }
      } catch (err) {
        GlobalErrorHandler.logError(
          err,
          "ReflectionGrid.handleTimeslicePress",
          {
            timesliceId: timeslice?.id,
          }
        );
      }
    },
    [getTimesliceWithDetails]
  );

  const handleTimesliceLongPress = useCallback(
    async (timeslice: Timeslice) => {
      try {
        if (!timeslice?.id || !timeslice?.activity_id) return;

        // If the same activity is already isolated, clear the isolation
        if (isolatedActivityId === timeslice.activity_id) {
          clearActivityIsolation();
        } else {
          // Isolate all timeslices of this activity
          isolateActivity(timeslice.activity_id);
        }
      } catch (err) {
        GlobalErrorHandler.logError(
          err,
          "ReflectionGrid.handleTimesliceLongPress",
          {
            timesliceId: timeslice?.id,
            activityId: timeslice?.activity_id,
          }
        );
      }
    },
    [isolatedActivityId, clearActivityIsolation, isolateActivity]
  );

  // Handle refresh effect - optimized with proper dependencies
  React.useEffect(() => {
    if (!refreshing) return;

    let isCancelled = false;

    const performRefresh = async () => {
      try {
        await refetch();
      } catch (err) {
        GlobalErrorHandler.logError(err, "ReflectionGrid.refresh", {
          dateRangeKey,
        });
      } finally {
        if (!isCancelled) {
          setRefreshing(false);
        }
      }
    };

    performRefresh();

    return () => {
      isCancelled = true;
    };
  }, [refreshing, refetch, dateRangeKey, setRefreshing]);

  // Handle errors with GlobalErrorHandler instead of ErrorBoundary
  const lastLoggedError = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (error && error !== lastLoggedError.current) {
      lastLoggedError.current = error;
      GlobalErrorHandler.logError(
        new Error(error),
        "ReflectionGrid.dataError",
        {
          fromDate: fromDate.toISOString(),
          toDate: toDate.toISOString(),
          gridDimensions,
        }
      );
    } else if (!error) {
      // Reset the logged error when error is cleared
      lastLoggedError.current = null;
    }
  }, [error, fromDate, toDate, gridDimensions]);

  // Performance monitoring effect
  React.useEffect(() => {
    const perfStart = performance.now();

    return () => {
      const perfEnd = performance.now();
      const renderTime = perfEnd - perfStart;

      if (renderTime > 100) {
        // Log slow renders > 100ms
        GlobalErrorHandler.logWarning(
          `Slow render detected: ${renderTime.toFixed(2)}ms`,
          "ReflectionGrid",
          {
            gridDimensions,
            timesliceStats,
            dateRangeKey,
          }
        );
      }
    };
  }, [parsedTimeslices, gridDimensions, timesliceStats, dateRangeKey]);

  return (
    <View style={reflectionStyles.reflectionGridRoot}>
      <View style={reflectionStyles.reflectionGridFixedDateAxisContainer}>
        <View
          style={[
            styles.container,
            { backgroundColor: theme.background.primary },
          ]}
        >
          <ReflectionDateAxis
            dates={dates}
            selectedColumns={selectedColumns}
            toggleColumn={toggleColumn}
            resetSelectedColumns={resetSelectedColumns}
          />
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        ref={gridScrollViewRef}
        style={reflectionStyles.reflectionGridScrollableContainer}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#666"
            title="Pull to refresh"
            titleColor="#666"
          />
        }
      >
        <View style={reflectionStyles.reflectionGridScrollContentContainer}>
          <View style={reflectionStyles.reflectionGridGridContainer}>
            <View style={reflectionStyles.reflectionGridGrid}>
              {/* Time column as the first column */}
              <ReflectionTimeAxis
                hours={timeSlots}
                hoursScrollViewRef={hoursScrollViewRef}
                toggleRow={toggleRow}
                resetSelectedRows={resetSelectedRows}
              />

              {/* Date columns */}
              {dates.map((date, dateIndex) => {
                const isColumnSelected =
                  selectedColumns.length === 0 ||
                  selectedColumns.includes(date.full);

                return (
                  <MemoizedDateColumn
                    key={`${date.full}-${dateIndex}`}
                    date={date}
                    dateIndex={dateIndex}
                    timeSlots={timeSlots}
                    parsedTimeslices={parsedTimeslices}
                    selectedRows={selectedRows}
                    isColumnSelected={isColumnSelected}
                    isolatedActivityId={isolatedActivityId}
                    highlightedTimeslice={highlightedTimeslice}
                    onTimeslicePress={handleTimeslicePress}
                    onTimesliceLongPress={handleTimesliceLongPress}
                    onClearIsolation={clearActivityIsolation}
                  />
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Comparison function for React.memo to optimize re-renders
const arePropsEqual = (
  prevProps: ScheduleGridProps,
  nextProps: ScheduleGridProps
) => {
  return (
    prevProps.fromDate.getTime() === nextProps.fromDate.getTime() &&
    prevProps.toDate.getTime() === nextProps.toDate.getTime() &&
    prevProps.refreshing === nextProps.refreshing
  );
};

export default React.memo(ReflectionGrid, arePropsEqual);
