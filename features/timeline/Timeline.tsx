import { useDialogStore, useSelectionStore } from "@/shared/stores/";
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
import { DaySeparator } from "./components/ui/DaySeparator";
import { PreviousDayButton } from "./components/ui/PreviousDayButton";

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
const Timeline = forwardRef<TimelineRef, {}>((props, ref) => {
  // State to track if yesterday's timeslices are visible and loaded
  const [showYesterday, setShowYesterday] = useState(false);
  const [yesterdayLoaded, setYesterdayLoaded] = useState(false);

  // Use centralized dialog store instead of local state
  const openDialog = useDialogStore((s) => s.openDialog);

  // Custom hooks for data management and actions
  // Provide a stable 'today' Date to the data hook so it doesn't compute its own
  const today = React.useMemo(() => new Date(), []);

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

  // Scrolling behavior hook (must be called after timesliceComponents is
  // defined so its memo length is stable for the hook's dependencies)
  const {
    scrollViewRef,
    showPreviousDayButton,
    scrollToCurrentTime,
    forceScrollToCurrentTime,
    handleScroll,
    handlePreviousDayPress,
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
      scrollEnabled={false}
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
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{
            alignItems: "stretch",
            paddingVertical: 6,
          }}
        >
          {/* Previous Day Button - shown as first item when at left edge */}
          <PreviousDayButton
            visible={showPreviousDayButton && !yesterdayLoaded}
            onPress={handlePreviousDayPress}
          />

          {/* Yesterday's timeslices - only rendered when loaded */}
          {yesterdayLoaded && (
            <TimelineTimeslices
              timeslices={yesterdayTimeslices}
              activities={activities}
              onTimeslicePress={handleTimeslicePress}
              onTimesliceLongPress={handleTimesliceLongPress}
              onIconPress={handleIconPress}
              keyPrefix="yesterday"
            />
          )}

          {/* Day Separator - only shown when yesterday is loaded */}
          <DaySeparator
            visible={yesterdayLoaded}
            showYesterday={showYesterday}
            onPress={handleHidePreviousDay}
          />

          {/* Today's timeslices */}
          <TimelineTimeslices
            timeslices={todayTimeslices}
            activities={activities}
            onTimeslicePress={handleTimeslicePress}
            onTimesliceLongPress={handleTimesliceLongPress}
            onIconPress={handleIconPress}
            keyPrefix="today"
          />
        </ScrollView>
      </View>
    </ScrollView>
  );
});

export default Timeline;
