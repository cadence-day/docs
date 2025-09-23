import { useDialogStore, useSelectionStore } from "@/shared/stores/";
import useTimeslicesStore from "@/shared/stores/resources/useTimeslicesStore";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import {
  InteractionManager,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";

// Components
import { TimelineTimeslices } from "./components/TimelineTimeslices";

// Types
import { Timeslice } from "@/shared/types/models";

// Define ref interface for Timeline component
export interface TimelineRef {
  scrollToCurrentTime: () => void;
}

// Hooks
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { COLORS } from "../../shared/constants/COLORS";
import {
  TIMESLICE_MARGIN_HORIZONTAL,
  TIMESLICE_WIDTH,
} from "./constants/dimensions";
import { useAutomaticTimesliceCreation } from "./hooks/useAutomaticTimesliceCreation";
import scrollToIndexAtOneThird from "./hooks/useScrollToCurrent";
import { useTimelineActions } from "./hooks/useTimelineActions";
import { useTimelineData } from "./hooks/useTimelineData";
import { useTimelineRefresh } from "./hooks/useTimelineRefresh";
import useWheelHaptics from "./hooks/useWheelHaptics";
import { styles } from "./styles";

/**
 * Timeline component displays a horizontal scrollable timeline of timeslices,
 * 48 half-hour slots in a specific date, with support for refreshing
 */
type TimelineProps = {
  date?: Date;
};

const Timeline = forwardRef<TimelineRef, TimelineProps>(({ date }, ref) => {
  // Use centralized dialog store instead of local state
  const openDialog = useDialogStore((s) => s.openDialog);
  const getDialogs = useDialogStore((s) => s.dialogs);
  const closeDialog = useDialogStore((s) => s.closeDialog);
  const toggleCollapse = useDialogStore((s) => s.toggleCollapse);

  // Custom hooks for data management and actions
  // Use provided date if available; create a normalized Date object to avoid mutation
  const targetDate = React.useMemo(() => {
    if (!date) return new Date();
    if (typeof date === "number" || typeof date === "string")
      return new Date(date);
    if (date instanceof Date) return new Date(date.getTime());
    GlobalErrorHandler.logWarning(
      "Timeline received unexpected date type",
      "Timeline:targetDate",
      { type: typeof date, value: date }
    );
    return new Date();
  }, [date]);

  // Get timeslices for today from the data hook
  const {
    Timeslices: dateTimeslices,
    activities,
    dateForDisplay,
  } = useTimelineData(targetDate);

  // Get setTimesliceId form
  const setTimesliceId = useSelectionStore((s) => s.setSelectedTimesliceId);

  const { handleTimeslicePress, handleTimesliceLongPress } =
    useTimelineActions();

  // Enable automatic timeslice creation when activity is selected
  useAutomaticTimesliceCreation();

  // Enhanced delete handler with explosion effect
  const handleTimesliceLongPressWithExplosion = (timeslice: Timeslice) => {
    const timesliceId = timeslice.id;

    if (timesliceId) {
      // If no ID (empty timeslice), call original handler directly
      handleTimesliceLongPress(timeslice);
    }
  };
  const { isRefreshing, onRefresh } = useTimelineRefresh();

  // use wheel haptics hook
  const {
    handleScroll: handleWheelScroll,
    handleScrollEndDrag,
    handleMomentumScrollBegin,
    handleMomentumScrollEnd,
  } = useWheelHaptics();

  // Ref to the horizontal ScrollView so we can programmatically scroll
  const horizontalScrollRef = useRef<ScrollView | null>(null);

  // Expose a scrollToCurrentTime method via the forwarded ref.
  useImperativeHandle(ref, () => ({
    scrollToCurrentTime: () => {
      try {
        // Find the index of the timeslice that contains the current time
        const now = Date.now();
        const idx = (dateTimeslices || []).findIndex((ts) => {
          if (!ts.start_time || !ts.end_time) return false;
          const start = Date.parse(String(ts.start_time));
          const end = Date.parse(String(ts.end_time));
          return (
            !Number.isNaN(start) &&
            !Number.isNaN(end) &&
            now >= start &&
            now < end
          );
        });

        if (idx >= 0) {
          scrollToIndexAtOneThird(
            horizontalScrollRef as any,
            idx,
            TIMESLICE_WIDTH,
            TIMESLICE_MARGIN_HORIZONTAL
          );
        }
      } catch {
        // swallow errors
      }
    },
  }));

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

  // Auto-scroll to current timeslice whenever the displayed date or
  // timeslices change — this covers opening today's screen and date
  // navigation changes.
  React.useEffect(() => {
    // The scroll should run after interactions/layout have finished so the
    // horizontal ScrollView has measured its content. Use InteractionManager
    // and a short timeout to avoid races on various platforms.
    let interactionHandle: any = null;
    let timeoutId: any = null;

    try {
      if (!dateForDisplay) return;
      const displayDate = new Date(dateForDisplay);
      const isToday = displayDate.toDateString() === new Date().toDateString();
      if (!isToday) return;

      const runScroll = () => {
        try {
          // Use the display array (placeholders when empty) so we always
          // have a stable length to compute the index from.
          const displayDateTimeslicesLocal =
            dateTimeslices && dateTimeslices.length > 0
              ? dateTimeslices
              : generatePlaceholders(dateForDisplay ?? targetDate);

          const now = Date.now();
          const idx = (displayDateTimeslicesLocal || []).findIndex((ts) => {
            if (!ts.start_time || !ts.end_time) return false;
            const start = Date.parse(String(ts.start_time));
            const end = Date.parse(String(ts.end_time));
            return (
              !Number.isNaN(start) &&
              !Number.isNaN(end) &&
              now >= start &&
              now < end
            );
          });

          if (idx >= 0) {
            scrollToIndexAtOneThird(
              horizontalScrollRef as any,
              idx,
              TIMESLICE_WIDTH,
              TIMESLICE_MARGIN_HORIZONTAL
            );
          }
        } catch {
          // swallow
        }
      };

      // Wait for interactions/layout
      interactionHandle = InteractionManager.runAfterInteractions(() => {
        // small delay to let layout settle on some devices
        timeoutId = setTimeout(runScroll, 50) as any;
      });
    } catch {
      // swallow
    }

    return () => {
      // cancel pending interaction and timeout
      if (interactionHandle && typeof interactionHandle.cancel === "function") {
        try {
          interactionHandle.cancel();
        } catch {}
      }
      if (timeoutId) clearTimeout(timeoutId as any);
    };
  }, [dateForDisplay, dateTimeslices, date, generatePlaceholders, targetDate]);

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
        // Calculate date range: from start of day to start of next day
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const startOfNextDay = new Date(startOfDay);
        startOfNextDay.setDate(startOfNextDay.getDate() + 1);

        // Get the current store state
        const timeslicesStore = useTimeslicesStore.getState();

        // Check if we already have timeslices for this date
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

        // Only fetch if we don't have data for this date
        if (existingTimeslicesForDate.length === 0) {
          GlobalErrorHandler.logDebug(
            `Fetching timeslices for date: ${targetDate.toDateString()}`,
            "Timeline:fetch",
            { date: targetDate.toDateString() }
          );

          // Set loading state
          timeslicesStore.setLoading(true);

          // Fetch timeslices for the date range
          const fetchedTimeslices = await timeslicesStore.getTimeslicesFromTo(
            startOfDay,
            startOfNextDay
          );

          if (mounted && fetchedTimeslices && fetchedTimeslices.length > 0) {
            GlobalErrorHandler.logDebug(
              `Fetched ${fetchedTimeslices.length} timeslices for ${targetDate.toDateString()}`,
              "Timeline:fetch",
              {
                count: fetchedTimeslices.length,
                date: targetDate.toDateString(),
              }
            );

            // Filter out duplicates
            const currentTimeslices = useTimeslicesStore.getState().timeslices;
            const newTimeslices = fetchedTimeslices.filter((fetched) => {
              return !currentTimeslices.some(
                (existing) => existing.id === fetched.id
              );
            });

            if (newTimeslices.length > 0) {
              // Use a micro-task to avoid concurrent rendering issues
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
        GlobalErrorHandler.logError(err as Error, "Timeline:fetch", {});
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

  // Handle note dialog - ensure only one container is expanded at a time
  const handleIconPress = (timeslice: Timeslice) => {
    setTimesliceId(timeslice.id);

    // Collapse all persistent dialogs (like activity dialogs) and close non-persistent ones
    Object.entries(getDialogs).forEach(([id, dialog]) => {
      if (dialog.props?.preventClose) {
        // Collapse persistent dialogs if they're not already collapsed
        if (!dialog.collapsed) {
          toggleCollapse(id);
        }
      } else {
        // Close non-persistent dialogs
        closeDialog(id);
      }
    });

    // Then open the note dialog (even though it doesn't exist yet, this is the intended behavior)
    openDialog({
      type: "note",
      props: { timeslice },
      position: "dock",
    });
  };

  return (
    <ScrollView
      style={styles.scrollWrapper}
      contentContainerStyle={styles.scrollWrapperContent}
      showsVerticalScrollIndicator={false}
      // Allow vertical scrolling so RefreshControl (pull-to-refresh) can be used
      scrollEnabled={true}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
          progressBackgroundColor={COLORS.white}
        />
      }
    >
      <View style={styles.horizontalContainer}>
        <ScrollView
          horizontal
          ref={horizontalScrollRef}
          nestedScrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleWheelScroll}
          onScrollEndDrag={handleScrollEndDrag}
          onMomentumScrollBegin={handleMomentumScrollBegin}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          contentContainerStyle={styles.horizontalContent}
        >
          {/* Timeslices for the requested date */}
          <TimelineTimeslices
            timeslices={displayDateTimeslices}
            activities={activities}
            onTimeslicePress={handleTimeslicePress}
            onTimesliceLongPress={handleTimesliceLongPressWithExplosion}
            onIconPress={handleIconPress}
            keyPrefix="date"
            dateForDisplay={dateForDisplay}
          />
        </ScrollView>
      </View>
    </ScrollView>
  );
});

export default Timeline;
