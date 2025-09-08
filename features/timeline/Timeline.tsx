import { useDialogStore, useSelectionStore } from "@/shared/stores/";
import useTimeslicesStore from "@/shared/stores/resources/useTimeslicesStore";
import * as Haptics from "expo-haptics";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { RefreshControl, ScrollView, View } from "react-native";

// Components
import { TimelineTimeslices } from "./components/TimelineTimeslices";

// Types
import { Timeslice } from "@/shared/types/models";

// Define ref interface for Timeline component
export interface TimelineRef {
  scrollToCurrentTime: () => void;
}

// Hooks
import { useTimelineActions } from "./hooks/useTimelineActions";
import { useTimelineData } from "./hooks/useTimelineData";
import { useTimelineRefresh } from "./hooks/useTimelineRefresh";
import { useTimelineScrolling } from "./hooks/useTimelineScrolling";

/**
 * Timeline component displays a horizontal scrollable timeline of timeslices,
 * 48 half-hour slots in a day + 48 timeslices for yesterday
 */
type TimelineProps = {
  date?: Date;
};

const Timeline = forwardRef<TimelineRef, TimelineProps>(({ date }, ref) => {
  // State to track if yesterday's timeslices are visible and loaded
  const [showYesterday, setShowYesterday] = useState(false);
  const [yesterdayLoaded, setYesterdayLoaded] = useState(false);

  // Use centralized dialog store instead of local state
  const openDialog = useDialogStore((s) => s.openDialog);

  // Custom hooks for data management and actions
  // Use provided date if available, otherwise default to now
  const today = React.useMemo(
    () => (date ? new Date(date) : new Date()),
    [date]
  );

  // Also derive yesterday's date (used for the optional previous day view)
  const yesterdayDate = React.useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return d;
  }, [today]);

  // Get timeslices for today and yesterday from the data hook
  const {
    Timeslices: todayTimeslices,
    activities,
    dateForDisplay,
  } = useTimelineData(today);

  const { Timeslices: yesterdayTimeslices } = useTimelineData(yesterdayDate);

  // Get setTimesliceId form
  const setTimesliceId = useSelectionStore((s) => s.setSelectedTimesliceId);

  const { handleTimeslicePress, handleTimesliceLongPress } =
    useTimelineActions();
  const { refreshing, isTimelineLoading, onRefresh } = useTimelineRefresh();

  // Build a lightweight "components" array (used by the scrolling hook to
  // compute widths/length). The hook only needs a length-like array, so we
  // reuse the timeslice arrays.
  const timesliceComponents = React.useMemo(() => {
    if (yesterdayLoaded) return [...yesterdayTimeslices, ...todayTimeslices];
    return todayTimeslices;
  }, [yesterdayLoaded, yesterdayTimeslices, todayTimeslices]);

  // If there are no timeslices for today (rare), generate empty placeholders
  // so the timeline still shows the empty timeslice containers (48 slots)
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

  const displayTodayTimeslices =
    todayTimeslices && todayTimeslices.length > 0
      ? todayTimeslices
      : generatePlaceholders(dateForDisplay ?? today);

  // Scrolling behavior hook (must be called after timesliceComponents is
  // defined so its memo length is stable for the hook's dependencies)
  const {
    scrollViewRef,
    showPreviousDayButton,
    scrollToCurrentTime,
    forceScrollToCurrentTime,
    handleScroll,
  } = useTimelineScrolling({
    timesliceComponents,
    yesterdayLoaded,
    showYesterday,
    setYesterdayLoaded,
    setShowYesterday,
  });

  // Expose methods through ref
  useImperativeHandle(
    ref,
    () => ({
      scrollToCurrentTime: forceScrollToCurrentTime,
    }),
    [forceScrollToCurrentTime]
  );

  // Auto-scroll to current time when component mounts
  useEffect(() => {
    scrollToCurrentTime();
  }, [scrollToCurrentTime]);

  // When the provided date prop changes, fetch timeslices for that day
  useEffect(() => {
    let mounted = true;

    const fetchForDate = async () => {
      try {
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const startOfNextDay = new Date(startOfDay);
        startOfNextDay.setDate(startOfNextDay.getDate() + 1);

        const fetched = await useTimeslicesStore
          .getState()
          .getTimeslicesFromTo(startOfDay, startOfNextDay);

        if (mounted && fetched && fetched.length > 0) {
          // Upsert results into the store so the data hook sees them
          await useTimeslicesStore.getState().upsertTimeslices(fetched);
        }
      } catch (err) {
        console.error("Error fetching timeslices for date", err);
      }
    };

    fetchForDate();

    return () => {
      mounted = false;
    };
  }, [today]);

  // Handle note dialog - this will close activities dialog automatically
  const handleIconPress = (timeslice: Timeslice) => {
    setTimesliceId(timeslice.id);
    // openDialog expects a DialogSpec-like object; cast to any to satisfy the call site
    openDialog({
      type: "note",
      props: { timeslice },
      position: "dock",
    });
    console.log("Opening note dialog for timeslice:", timeslice);
  };

  // Handle hiding previous day
  const handleHidePreviousDay = () => {
    // Add haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setYesterdayLoaded(false);
    setShowYesterday(false);

    // Scroll to the beginning of today's timeline
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        x: 0,
        animated: true,
      });
    }, 100);
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      // Allow vertical scrolling so RefreshControl (pull-to-refresh) can be used
      scrollEnabled={true}
      refreshControl={
        <RefreshControl
          refreshing={refreshing || isTimelineLoading}
          onRefresh={onRefresh}
          tintColor="#6646EC"
          colors={["#6646EC"]}
          progressBackgroundColor="#F0F0F0"
        />
      }
    >
      <View
        style={{
          flex: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <ScrollView
          ref={scrollViewRef}
          horizontal
          // allow inner horizontal ScrollView to participate in nested scrolling
          nestedScrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{
            alignItems: "stretch",
            paddingVertical: 6,
          }}
        >
          {/* Today's timeslices */}
          <TimelineTimeslices
            timeslices={todayTimeslices}
            activities={activities}
            onTimeslicePress={handleTimeslicePress}
            onTimesliceLongPress={handleTimesliceLongPress}
            onIconPress={handleIconPress}
            keyPrefix="today"
            dateForDisplay={dateForDisplay}
          />
        </ScrollView>
      </View>
    </ScrollView>
  );
});

export default Timeline;
