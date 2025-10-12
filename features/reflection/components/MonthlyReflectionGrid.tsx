/**
 * MonthlyReflectionGrid Component
 *
 * Displays activity data in a monthly grid format with days on the y-axis and hours on the x-axis.
 * Supports pinch-to-zoom gestures for both horizontal (hours) and vertical (days) dimensions.
 *
 * Feature Flag: This component is gated by the 'monthly-reflection' feature flag.
 * The flag is checked in the parent reflection screen (app/(home)/reflection.tsx).
 */

import { useProfileStore } from "@/features/profile/stores/useProfileStore";
import { useTheme } from "@/shared/hooks";
import useI18n from "@/shared/hooks/useI18n";
import { useDialogStore } from "@/shared/stores";
import { Timeslice } from "@/shared/types/models";
import { Logger } from "@/shared/utils/errorHandler";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { REFLECTION_LAYOUT } from "../constants/layout";
import { useReflectionData } from "../hooks/useReflectionData";
import { useTimesliceStatistics } from "../hooks/useTimesliceStatistics";
import { reflectionStyles } from "../styles";
import {
  EmptyMonthlyReflectionCell,
  MonthlyReflectionCell,
} from "./MonthlyReflectionCell";

type MonthlyReflectionGridProps = {
  fromDate: Date;
  toDate: Date;
  refreshing: boolean;
  setRefreshing: (refreshing: boolean) => void;
};

// Memoized day row component (now renders horizontally with hours as columns)
type DayRowProps = {
  day: number;
  dayIndex: number;
  timeSlots: string[];
  parsedTimeslices: Record<string, Record<string, Timeslice | null>>;
  dateString: string;
  isolatedActivityId: string | null;
  highlightedTimeslice: Timeslice | null;
  onTimeslicePress: (timeslice: Timeslice) => void;
  onTimesliceLongPress: (timeslice: Timeslice) => void;
  onClearIsolation: () => void;
  visibleHoursStart: number;
  visibleHoursEnd: number;
  cellWidth: number;
  cellHeight: number;
};

const DayRow: React.FC<DayRowProps> = ({
  day,
  timeSlots,
  parsedTimeslices,
  dateString,
  isolatedActivityId,
  highlightedTimeslice,
  onTimeslicePress,
  onTimesliceLongPress,
  onClearIsolation,
  visibleHoursStart,
  visibleHoursEnd,
  cellWidth,
  cellHeight,
}) => {
  // Filter time slots based on visible hours
  const visibleTimeSlots = useMemo(() => {
    return timeSlots.filter((timeSlot) => {
      const [hour] = timeSlot.split(":").map(Number);
      return hour >= visibleHoursStart && hour < visibleHoursEnd;
    });
  }, [timeSlots, visibleHoursStart, visibleHoursEnd]);

  return (
    <View style={reflectionStyles.reflectionGridDateRow}>
      {visibleTimeSlots.map((timeSlot, timeIndex) => {
        const timeslice = parsedTimeslices[dateString]?.[timeSlot];

        let isDimmed = false;
        let isolationOpacity = 1;

        if (isolatedActivityId) {
          const isIsolatedActivity =
            timeslice && timeslice.activity_id === isolatedActivityId;
          isDimmed = !isIsolatedActivity;
          isolationOpacity = isIsolatedActivity ? 1 : 0.15;
        }

        if (timeslice) {
          const isSelectedTimeslice = highlightedTimeslice?.id === timeslice.id;
          return (
            <MonthlyReflectionCell
              key={`${day}-${timeIndex}`}
              timeslice={timeslice}
              onPress={() => onTimeslicePress(timeslice)}
              onLongPress={() => onTimesliceLongPress(timeslice)}
              dimmed={isDimmed}
              notSelectedOpacity={isolationOpacity}
              isSelected={isSelectedTimeslice}
              cellWidth={cellWidth}
              cellHeight={cellHeight}
            />
          );
        } else {
          return (
            <EmptyMonthlyReflectionCell
              key={`${day}-${timeIndex}`}
              dimmed={isDimmed}
              notSelectedOpacity={isolationOpacity}
              onLongPress={isolatedActivityId ? onClearIsolation : undefined}
              cellWidth={cellWidth}
              cellHeight={cellHeight}
            />
          );
        }
      })}
    </View>
  );
};

const MemoizedDayRow = React.memo(DayRow);

const MonthlyReflectionGrid: React.FC<MonthlyReflectionGridProps> = ({
  fromDate,
  toDate,
  refreshing,
  setRefreshing,
}) => {
  const { t, getCurrentLanguage } = useI18n();
  const theme = useTheme();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const { parsedTimeslices, isLoading, error, refetch, getDateRange } =
    useReflectionData(fromDate, toDate);
  const [selectedTimeslice, setSelectedTimeslice] = useState<Timeslice | null>(
    null
  );
  const [isolatedActivityId, setIsolatedActivityId] = useState<string | null>(
    null
  );

  // Calculate dynamic dimensions based on screen size
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const DAY_LABEL_WIDTH = 20;
  const HOUR_LABEL_HEIGHT = 35;

  // Account for SafeArea insets, header, and bottom navigation
  // Approximate heights: status bar (~47), header (~80), bottom tab bar (~83), margins (~40)
  const TOTAL_UI_HEIGHT = 250;

  // Calculate available space for the grid
  const availableWidth = screenWidth - DAY_LABEL_WIDTH; // Full width minus day labels
  const availableHeight = screenHeight - HOUR_LABEL_HEIGHT - TOTAL_UI_HEIGHT;

  // Zoom state: visible hours and days
  const [visibleHoursStart, setVisibleHoursStart] = useState<number>(
    REFLECTION_LAYOUT.START_HOUR
  );
  const [visibleHoursEnd, setVisibleHoursEnd] = useState<number>(
    REFLECTION_LAYOUT.END_HOUR
  );
  const [visibleDaysStart, setVisibleDaysStart] = useState(1);
  const [visibleDaysEnd, setVisibleDaysEnd] = useState(31);

  // Track dialog state
  const dialogStore = useDialogStore();
  const isTimesliceDialogOpen = useMemo(() => {
    return Object.values(dialogStore.dialogs).some(
      (dialog) => dialog.type === "reflection-timeslice-info"
    );
  }, [dialogStore.dialogs]);

  // Find current ongoing timeslice
  const currentTimeslice = useMemo(() => {
    const now = Date.now();
    const today = new Date().toLocaleDateString();

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

  const highlightedTimeslice = useMemo(() => {
    if (isTimesliceDialogOpen) {
      return selectedTimeslice;
    } else {
      return currentTimeslice;
    }
  }, [isTimesliceDialogOpen, selectedTimeslice, currentTimeslice]);

  useEffect(() => {
    if (!isTimesliceDialogOpen && selectedTimeslice) {
      setSelectedTimeslice(null);
    }
  }, [isTimesliceDialogOpen, selectedTimeslice]);

  const { getTimesliceWithDetails } = useTimesliceStatistics(fromDate, toDate);

  const isolateActivity = useCallback((activityId: string) => {
    setIsolatedActivityId(activityId);
  }, []);

  const clearActivityIsolation = useCallback(() => {
    setIsolatedActivityId(null);
  }, []);

  const dateRangeKey = useMemo(() => {
    return `${fromDate.getTime()}-${toDate.getTime()}`;
  }, [fromDate, toDate]);

  const gridScrollViewRef = useRef<ScrollView>(null);
  const hoursScrollViewRef = useRef<ScrollView>(null);
  const verticalScrollViewRef = useRef<ScrollView>(null);

  const { settings } = useProfileStore();

  // Calculate days in month
  const daysInMonth = useMemo(() => {
    const year = fromDate.getFullYear();
    const month = fromDate.getMonth();
    return new Date(year, month + 1, 0).getDate();
  }, [fromDate]);

  // Calculate time slots
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let hour = visibleHoursStart; hour < visibleHoursEnd; hour++) {
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
  }, [visibleHoursStart, visibleHoursEnd]);

  // Calculate dynamic cell dimensions to fit screen
  const numVisibleHours = visibleHoursEnd - visibleHoursStart;
  const numVisibleDays = visibleDaysEnd - visibleDaysStart + 1;
  const numHourSlots = timeSlots.length;

  const cellSize = useMemo(() => {
    // Calculate cell size to fit days vertically
    const totalMarginHeight =
      (numVisibleDays - 1) * REFLECTION_LAYOUT.CELL_MARGIN;
    const availableForCells = availableHeight - totalMarginHeight;
    const size = Math.floor(availableForCells / numVisibleDays);
    return size;
  }, [availableHeight, numVisibleDays]);

  // Use same size for both width and height to make cells square
  const cellWidth = cellSize;
  const cellHeight = cellSize;

  // Pinch gesture for horizontal zoom (hours)
  const pinchHorizontal = Gesture.Pinch()
    .onUpdate((event) => {
      const scale = event.scale;
      const totalHours =
        REFLECTION_LAYOUT.END_HOUR - REFLECTION_LAYOUT.START_HOUR;
      const currentVisibleHours = visibleHoursEnd - visibleHoursStart;

      // Calculate new visible hours based on pinch scale
      let newVisibleHours = Math.round(currentVisibleHours / scale);
      newVisibleHours = Math.max(2, Math.min(totalHours, newVisibleHours));

      // Center the zoom around current midpoint
      const midpoint = (visibleHoursStart + visibleHoursEnd) / 2;
      const newStart = Math.max(
        REFLECTION_LAYOUT.START_HOUR,
        Math.round(midpoint - newVisibleHours / 2)
      );
      const newEnd = Math.min(
        REFLECTION_LAYOUT.END_HOUR,
        newStart + newVisibleHours
      );

      setVisibleHoursStart(newStart);
      setVisibleHoursEnd(newEnd);
    })
    .runOnJS(true);

  // Pinch gesture for vertical zoom (days)
  const pinchVertical = Gesture.Pinch()
    .onUpdate((event) => {
      const scale = event.scale;
      const currentVisibleDays = visibleDaysEnd - visibleDaysStart + 1;

      // Calculate new visible days based on pinch scale
      let newVisibleDays = Math.round(currentVisibleDays / scale);
      newVisibleDays = Math.max(7, Math.min(daysInMonth, newVisibleDays));

      // Center the zoom around current midpoint
      const midpoint = (visibleDaysStart + visibleDaysEnd) / 2;
      const newStart = Math.max(1, Math.round(midpoint - newVisibleDays / 2));
      const newEnd = Math.min(daysInMonth, newStart + newVisibleDays - 1);

      setVisibleDaysStart(newStart);
      setVisibleDaysEnd(newEnd);
    })
    .runOnJS(true);

  const composed = Gesture.Simultaneous(pinchHorizontal, pinchVertical);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
      clearActivityIsolation();
    } catch (err) {
      Logger.logError(err, "MonthlyReflectionGrid.handleRefresh", {
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

        setSelectedTimeslice(timeslice);

        const enhancedInfo = await getTimesliceWithDetails(timeslice.id);

        if (enhancedInfo) {
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
        }
      } catch (err) {
        Logger.logError(err, "MonthlyReflectionGrid.handleTimeslicePress", {
          timesliceId: timeslice?.id,
        });
      }
    },
    [getTimesliceWithDetails]
  );

  const handleTimesliceLongPress = useCallback(
    async (timeslice: Timeslice) => {
      try {
        if (!timeslice?.id || !timeslice?.activity_id) return;

        if (isolatedActivityId === timeslice.activity_id) {
          clearActivityIsolation();
        } else {
          isolateActivity(timeslice.activity_id);
        }
      } catch (err) {
        Logger.logError(err, "MonthlyReflectionGrid.handleTimesliceLongPress", {
          timesliceId: timeslice?.id,
          activityId: timeslice?.activity_id,
        });
      }
    },
    [isolatedActivityId, clearActivityIsolation, isolateActivity]
  );

  // Render hour labels (x-axis)
  const hourLabels = useMemo(() => {
    const labels = [];
    const slotsPerHour = 60 / REFLECTION_LAYOUT.MINUTES_PER_SLOT;
    const is24HourFormat =
      !settings?.timeFormat || settings?.timeFormat === "24h"; // Default to 24h if not set

    // Ensure we have valid dimensions before rendering
    if (cellWidth <= 0) return labels;

    for (let hour = visibleHoursStart; hour < visibleHoursEnd; hour++) {
      // Format hour based on 12/24 hour setting - NO leading zeros
      let displayHour: string;
      if (is24HourFormat) {
        // 24-hour format: show 0, 1, 2, ..., 23
        displayHour = hour.toString();
      } else {
        // 12-hour format: show 12, 1, 2, ..., 11, 12, 1, ..., 11
        const hour12 = hour % 12 === 0 ? 12 : hour % 12;
        displayHour = hour12.toString();
      }

      // Main hour label - aligned to the start of the corresponding cells
      labels.push(
        <View
          key={`hour-${hour}`}
          style={{
            width: cellWidth * slotsPerHour,
            paddingVertical: 4,
            justifyContent: "flex-start",
            alignItems: "flex-start",
            paddingLeft: 2,
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: "600" }}>{displayHour}</Text>
        </View>
      );
    }
    return labels;
  }, [visibleHoursStart, visibleHoursEnd, cellWidth, settings?.timeFormat]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={composed}>
        <View style={reflectionStyles.reflectionGridRoot}>
          {/* Fixed axes container */}
          <View style={{ flexDirection: "row" }}>
            {/* Top-left corner spacer */}
            <View
              style={{ width: DAY_LABEL_WIDTH, height: HOUR_LABEL_HEIGHT }}
            />

            {/* Scrollable hour axis (x-axis) - synced with grid */}
            <ScrollView
              ref={hoursScrollViewRef}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              scrollEnabled={false}
              scrollEventThrottle={16}
            >
              <View style={{ flexDirection: "row" }}>{hourLabels}</View>
            </ScrollView>
          </View>

          {/* Scrollable Content - Vertical scroll for days */}
          <ScrollView
            ref={verticalScrollViewRef}
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
            {/* Horizontal scroll for hours */}
            <ScrollView
              ref={gridScrollViewRef}
              horizontal={true}
              showsHorizontalScrollIndicator={true}
              scrollEventThrottle={16}
              onScroll={(event) => {
                const offsetX = event.nativeEvent.contentOffset.x;
                hoursScrollViewRef.current?.scrollTo({
                  x: offsetX,
                  animated: false,
                });
              }}
            >
              <View
                style={reflectionStyles.reflectionGridScrollContentContainer}
              >
                <View style={reflectionStyles.reflectionGridGridContainer}>
                  {/* Grid: Days as rows (vertical), Hours as columns (horizontal) */}
                  {Array.from(
                    { length: visibleDaysEnd - visibleDaysStart + 1 },
                    (_, i) => {
                      const day = visibleDaysStart + i;
                      const date = new Date(fromDate);
                      date.setDate(day);
                      const dateString =
                        date.toLocaleDateString(getCurrentLanguage());

                      return (
                        <View
                          key={`day-row-${day}`}
                          style={{ flexDirection: "row" }}
                        >
                          {/* Day label (y-axis) */}
                          <View
                            style={{
                              width: DAY_LABEL_WIDTH,
                              height: cellHeight,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Text style={{ fontSize: 10, fontWeight: "600" }}>
                              {day}
                            </Text>
                          </View>

                          {/* Day row with hour cells */}
                          <MemoizedDayRow
                            day={day}
                            dayIndex={i}
                            timeSlots={timeSlots}
                            parsedTimeslices={parsedTimeslices}
                            dateString={dateString}
                            isolatedActivityId={isolatedActivityId}
                            highlightedTimeslice={highlightedTimeslice}
                            onTimeslicePress={handleTimeslicePress}
                            onTimesliceLongPress={handleTimesliceLongPress}
                            onClearIsolation={clearActivityIsolation}
                            visibleHoursStart={visibleHoursStart}
                            visibleHoursEnd={visibleHoursEnd}
                            cellWidth={cellWidth}
                            cellHeight={cellHeight}
                          />
                        </View>
                      );
                    }
                  )}
                </View>
              </View>
            </ScrollView>
          </ScrollView>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const arePropsEqual = (
  prevProps: MonthlyReflectionGridProps,
  nextProps: MonthlyReflectionGridProps
) => {
  return (
    prevProps.fromDate.getTime() === nextProps.fromDate.getTime() &&
    prevProps.toDate.getTime() === nextProps.toDate.getTime() &&
    prevProps.refreshing === nextProps.refreshing
  );
};

export default React.memo(MonthlyReflectionGrid, arePropsEqual);
