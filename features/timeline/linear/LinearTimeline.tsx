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

// Hooks
import { Logger } from "@/shared/utils/errorHandler";
import { COLORS } from "@/shared/constants/COLORS";
import {
  TIMESLICE_MARGIN_HORIZONTAL,
  TIMESLICE_WIDTH,
} from "../shared/dimensions";
import { useAutomaticTimesliceCreation } from "../shared/hooks/useAutomaticTimesliceCreation";
import scrollToIndexAtOneThird from "../shared/hooks/useScrollToCurrent";
import { useTimelineActions } from "../shared/hooks/useTimelineActions";
import { useTimelineData } from "../shared/hooks/useTimelineData";
import { useTimelineRefresh } from "../shared/hooks/useTimelineRefresh";
import useWheelHaptics from "../shared/hooks/useWheelHaptics";
import { styles } from "../shared/styles";

// Define ref interface for Timeline component
export interface LinearTimelineRef {
  scrollToCurrentTime: () => void;
}

/**
 * LinearTimeline component displays a horizontal scrollable timeline of timeslices,
 * 48 half-hour slots in a specific date, with support for refreshing
 */
type LinearTimelineProps = {
  date?: Date;
  bottomPadding?: number;
};

export const LinearTimeline = forwardRef<LinearTimelineRef, LinearTimelineProps>(
  ({ date, bottomPadding = 0 }, ref) => {
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
      Logger.logWarning(
        "LinearTimeline received unexpected date type",
        "LinearTimeline:targetDate",
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

    // Track the last date we auto-scrolled for, to prevent re-scrolling when timeslices are inserted
    const lastAutoScrolledDateRef = useRef<string | null>(null);

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
              horizontalScrollRef as React.RefObject<ScrollView>,
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

    // Auto-scroll to current timeslice only on initial load or when the date changes.
    // This prevents auto-scrolling when timeslices are inserted/updated.
    React.useEffect(() => {
      let interactionHandle: ReturnType<
        typeof InteractionManager.runAfterInteractions
      > | null = null;
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      try {
        if (!dateForDisplay) return;
        const displayDate = new Date(dateForDisplay);
        const isToday =
          displayDate.toDateString() === new Date().toDateString();
        if (!isToday) return;

        // Check if we've already auto-scrolled for this date
        const currentDateKey = displayDate.toDateString();
        if (lastAutoScrolledDateRef.current === currentDateKey) {
          // Already scrolled for this date, skip
          return;
        }

        const runScroll = () => {
          try {
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
                horizontalScrollRef as React.RefObject<ScrollView>,
                idx,
                TIMESLICE_WIDTH,
                TIMESLICE_MARGIN_HORIZONTAL
              );
              // Mark that we've scrolled for this date
              lastAutoScrolledDateRef.current = currentDateKey;
            }
          } catch {
            // swallow
          }
        };

        // Wait for interactions/layout
        interactionHandle = InteractionManager.runAfterInteractions(() => {
          // small delay to let layout settle on some devices
          timeoutId = setTimeout(runScroll, 50);
        });
      } catch {
        // swallow
      }

      return () => {
        // cancel pending interaction and timeout
        if (
          interactionHandle &&
          typeof interactionHandle.cancel === "function"
        ) {
          try {
            interactionHandle.cancel();
          } catch {}
        }
        if (timeoutId) clearTimeout(timeoutId);
      };
    }, [dateForDisplay, date, generatePlaceholders, targetDate]);

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
              "LinearTimeline:fetch",
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
                "LinearTimeline:fetch",
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
          Logger.logError(err as Error, "LinearTimeline:fetch", {});
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

    // Handle note dialog
    const handleIconPress = (timeslice: Timeslice) => {
      setTimesliceId(timeslice.id);

      Object.entries(getDialogs).forEach(([id, dialog]) => {
        if (dialog.props?.preventClose) {
          if (!dialog.collapsed) {
            toggleCollapse(id);
          }
        } else {
          closeDialog(id);
        }
      });

      openDialog({
        type: "note",
        props: { timeslice },
        position: "dock",
      });
    };

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
  }
);
