import { COLORS } from "@/shared/constants/COLORS";
import { useDeviceDateTime } from "@/shared/hooks/useDeviceDateTime";
import { Timeslice } from "@/shared/types/models";
import { useDialogStore, useSelectionStore } from "@/shared/stores";
import useTimeslicesStore from "@/shared/stores/resources/useTimeslicesStore";
import React, { useEffect, useRef } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Logger } from "@/shared/utils/errorHandler";
import { useAutomaticTimesliceCreation } from "../shared/hooks/useAutomaticTimesliceCreation";
import { useTimelineActions } from "../shared/hooks/useTimelineActions";
import { useTimelineData } from "../shared/hooks/useTimelineData";
import { useTimelineRefresh } from "../shared/hooks/useTimelineRefresh";
import { styles } from "../shared/styles";
import { CircularTimelineTimeslices } from "./components/CircularTimelineTimeslices";

interface CircularTimelineProps {
  date?: Date;
  bottomPadding?: number;
}

/**
 * CircularTimeline component displays timeslices in a radial/circular layout
 * with a clock display in the center showing the current time
 */
export const CircularTimeline: React.FC<CircularTimelineProps> = ({
  date,
  bottomPadding = 0,
}) => {
  const { formatTime } = useDeviceDateTime();

  // Use centralized stores
  const openDialog = useDialogStore((s) => s.openDialog);
  const getDialogs = useDialogStore((s) => s.dialogs);
  const closeDialog = useDialogStore((s) => s.closeDialog);
  const toggleCollapse = useDialogStore((s) => s.toggleCollapse);
  const setTimesliceId = useSelectionStore((s) => s.setSelectedTimesliceId);

  // Custom hooks for data management and actions
  const targetDate = React.useMemo(() => {
    if (!date) return new Date();
    if (typeof date === "number" || typeof date === "string")
      return new Date(date);
    if (date instanceof Date) return new Date(date.getTime());
    Logger.logWarning(
      "CircularTimeline received unexpected date type",
      "CircularTimeline:targetDate",
      { type: typeof date, value: date }
    );
    return new Date();
  }, [date]);

  const {
    Timeslices: dateTimeslices,
    activities,
    dateForDisplay,
  } = useTimelineData(targetDate);

  const { handleTimeslicePress, handleTimesliceLongPress } =
    useTimelineActions();

  useAutomaticTimesliceCreation();

  const handleTimesliceLongPressWithExplosion = (timeslice: Timeslice) => {
    const timesliceId = timeslice.id;
    if (timesliceId) {
      handleTimesliceLongPress(timeslice);
    }
  };

  const { isRefreshing, onRefresh } = useTimelineRefresh();

  // Calculate current time for center display
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Display date
  const displayDate = dateForDisplay ? new Date(dateForDisplay) : new Date();
  const startOfDisplayDay = new Date(displayDate);
  startOfDisplayDay.setHours(0, 0, 0, 0);
  const isTodayDisplay =
    startOfDisplayDay.toDateString() === new Date().toDateString();

  // Generate placeholders if needed
  const generatePlaceholders = React.useCallback((date: Date) => {
    const slots: Timeslice[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const localStartTime = new Date(date);
        localStartTime.setHours(hour, minute, 0, 0);
        const localEndTime = new Date(localStartTime);
        localEndTime.setMinutes(localEndTime.getMinutes() + 30);
        slots.push({
          id: null,
          start_time: localStartTime.toISOString(),
          end_time: localEndTime.toISOString(),
          activity_id: null,
          state_id: null,
          user_id: null,
          note_ids: null,
        } as Timeslice);
      }
    }
    return slots;
  }, []);

  const displayDateTimeslices =
    dateTimeslices && dateTimeslices.length > 0
      ? dateTimeslices
      : generatePlaceholders(dateForDisplay ?? targetDate);

  // Fetch timeslices when the timeline is loading or date changes
  useEffect(() => {
    let mounted = true;
    let fetchTimeoutId: number;

    const fetchTimeslicesForDate = async () => {
      try {
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const startOfNextDay = new Date(startOfDay);
        startOfNextDay.setDate(startOfNextDay.getDate() + 1);

        const timeslicesStore = useTimeslicesStore.getState();

        const existingTimeslicesForDate = timeslicesStore.timeslices.filter(
          (ts) => {
            if (!ts.start_time) return false;
            const tsDate = new Date(ts.start_time);
            const dayStart = new Date(targetDate);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(targetDate);
            dayEnd.setHours(23, 59, 59, 999);
            return tsDate >= dayStart && tsDate <= dayEnd;
          }
        );

        if (existingTimeslicesForDate.length === 0) {
          Logger.logDebug(
            `Fetching timeslices for date: ${targetDate.toDateString()}`,
            "CircularTimeline:fetch",
            { date: targetDate.toDateString() }
          );

          timeslicesStore.setLoading(true);

          const fetchedTimeslices = await timeslicesStore.getTimeslicesFromTo(
            startOfDay,
            startOfNextDay
          );

          if (mounted && fetchedTimeslices && fetchedTimeslices.length > 0) {
            Logger.logDebug(
              `Fetched ${fetchedTimeslices.length} timeslices for ${targetDate.toDateString()}`,
              "CircularTimeline:fetch",
              {
                count: fetchedTimeslices.length,
                date: targetDate.toDateString(),
              }
            );

            const currentTimeslices =
              useTimeslicesStore.getState().timeslices;
            const newTimeslices = fetchedTimeslices.filter((fetched) => {
              return !currentTimeslices.some(
                (existing) => existing.id === fetched.id
              );
            });

            if (newTimeslices.length > 0) {
              fetchTimeoutId = setTimeout(() => {
                if (mounted) {
                  useTimeslicesStore.setState((state) => ({
                    timeslices: [...state.timeslices, ...newTimeslices],
                    isLoading: false,
                  }));
                }
              }, 0) as unknown as number;
            } else {
              timeslicesStore.setLoading(false);
            }
          } else {
            if (mounted) {
              timeslicesStore.setLoading(false);
            }
          }
        }
      } catch (err) {
        Logger.logError(err as Error, "CircularTimeline:fetch", {});
        if (mounted) {
          const timeslicesStore = useTimeslicesStore.getState();
          timeslicesStore.setLoading(false);
          timeslicesStore.setError(
            err instanceof Error ? err.message : "Failed to fetch timeslices"
          );
        }
      }
    };

    fetchTimeslicesForDate();

    return () => {
      mounted = false;
      if (fetchTimeoutId) {
        clearTimeout(fetchTimeoutId);
      }
    };
  }, [date, targetDate]);

  // SVG dimensions
  const size = 360;
  const radius = 160;
  const innerRadius = 115;
  const clockRadius = 100;

  return (
    <ScrollView
      style={styles.scrollWrapper}
      contentContainerStyle={[
        styles.scrollWrapperContent,
        bottomPadding > 0 && { paddingBottom: bottomPadding },
      ]}
      showsVerticalScrollIndicator={false}
      scrollEnabled={true}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.brand.primary}
          colors={[COLORS.brand.primary]}
          progressBackgroundColor={COLORS.neutral.white}
        />
      }
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 40,
        }}
      >
        <CircularTimelineTimeslices
          timeslices={displayDateTimeslices}
          activities={activities}
          onTimeslicePress={handleTimeslicePress}
          onTimesliceLongPress={handleTimesliceLongPressWithExplosion}
          dateForDisplay={dateForDisplay}
          size={size}
          radius={radius}
          innerRadius={innerRadius}
          clockRadius={clockRadius}
        />

        {/* Center time display - absolute positioned over SVG */}
        <View
          style={{
            position: "absolute",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 42,
              fontWeight: "700",
              color: COLORS.light.text.primary,
            }}
          >
            {formatTime(
              isTodayDisplay
                ? currentTime.toISOString()
                : displayDate.toISOString()
            )}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};
