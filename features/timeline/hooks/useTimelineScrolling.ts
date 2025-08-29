// useTimelineScrolling.ts
import { useCallback, useRef, useState } from "react";
import { InteractionManager, ScrollView } from "react-native";
import * as Haptics from "expo-haptics";

interface UseTimelineScrollingProps {
    timesliceComponents: any[];
    yesterdayLoaded: boolean;
    showYesterday: boolean;
    setYesterdayLoaded: (loaded: boolean) => void;
    setShowYesterday: (show: boolean) => void;
}

/**
 * Custom hook to manage timeline scrolling behavior and auto-scroll functionality
 */
export const useTimelineScrolling = ({
    timesliceComponents,
    yesterdayLoaded,
    showYesterday,
    setYesterdayLoaded,
    setShowYesterday,
}: UseTimelineScrollingProps) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const hasAutoScrolledRef = useRef(false);
    const userHasScrolledRef = useRef(false);
    const [showPreviousDayButton, setShowPreviousDayButton] = useState(false);
    const [lastHapticTime, setLastHapticTime] = useState(0);

    // Calculate current time scroll position
    const calculateCurrentTimePosition = useCallback(() => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const totalMinutesSinceMidnight = currentHour * 60 + currentMinute;
        const slotsFromMidnight = Math.floor(totalMinutesSinceMidnight / 30);
        const slotWidth = 54;

        // Account for yesterday's content if loaded
        let offsetX = 0;
        if (yesterdayLoaded) {
            const yesterdayWidth = 48 * slotWidth; // 48 slots for yesterday
            const daySeperatorWidth = 50 + 16; // separator width + margins
            offsetX = yesterdayWidth + daySeperatorWidth;
        }

        // Account for the Previous Day button width when it's visible
        const buttonWidth = showPreviousDayButton && !yesterdayLoaded
            ? 46.5
            : 0;

        return offsetX + buttonWidth + (slotWidth * slotsFromMidnight) - 100;
    }, [yesterdayLoaded, showPreviousDayButton]);

    // Auto-scroll to current time position (only on first load)
    const scrollToCurrentTime = useCallback(() => {
        if (
            !hasAutoScrolledRef.current &&
            scrollViewRef.current &&
            timesliceComponents.length > 0
        ) {
            InteractionManager.runAfterInteractions(() => {
                const scrollPosition = calculateCurrentTimePosition();

                scrollViewRef.current?.scrollTo({
                    x: Math.max(0, scrollPosition),
                    animated: false,
                });
                hasAutoScrolledRef.current = true;
            });
        }
    }, [timesliceComponents.length, calculateCurrentTimePosition]);

    // Force scroll to current time (for "now" button or manual trigger)
    const forceScrollToCurrentTime = useCallback(() => {
        if (scrollViewRef.current) {
            const scrollPosition = calculateCurrentTimePosition();

            scrollViewRef.current.scrollTo({
                x: Math.max(0, scrollPosition),
                animated: true,
            });

            // Reset user scroll tracking when manually scrolling to current time
            userHasScrolledRef.current = false;
        }
    }, [calculateCurrentTimePosition]);

    // Handle scroll events for haptic feedback and yesterday visibility
    const handleScroll = useCallback(
        (event: any) => {
            const scrollX = event.nativeEvent.contentOffset.x;
            const slotWidth = 54;
            const buttonWidth = 46.5; // 42.5 + 4 margin

            // Mark that user has manually scrolled
            userHasScrolledRef.current = true;

            // Show "Previous day" button when scrolling to the far left (accounting for button width)
            const isAtLeftEdge = scrollX <= buttonWidth + 20;

            if (isAtLeftEdge !== showPreviousDayButton) {
                setShowPreviousDayButton(isAtLeftEdge);
                if (isAtLeftEdge) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
            }

            if (yesterdayLoaded) {
                const yesterdayWidth = 48 * slotWidth;
                const daySeperatorWidth = 19;
                const todayStartPosition = yesterdayWidth + daySeperatorWidth;

                // Check if we're viewing yesterday's timeslices
                const isShowingYesterday = scrollX < todayStartPosition - 50;

                // Remove yesterday timeslices when we're back on today's view
                if (
                    !isShowingYesterday &&
                    showYesterday &&
                    scrollX > todayStartPosition + 100
                ) {
                    setYesterdayLoaded(false);
                    setShowYesterday(false);

                    // Adjust scroll position to account for removed yesterday content
                    setTimeout(() => {
                        scrollViewRef.current?.scrollTo({
                            x: scrollX - todayStartPosition,
                            animated: false,
                        });
                    }, 50);
                }

                if (isShowingYesterday !== showYesterday) {
                    setShowYesterday(isShowingYesterday);

                    // Light haptic feedback when transitioning between days
                    const now = Date.now();
                    if (now - lastHapticTime > 200) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setLastHapticTime(now);
                    }
                }
            }
        },
        [
            showPreviousDayButton,
            yesterdayLoaded,
            showYesterday,
            lastHapticTime,
            setYesterdayLoaded,
            setShowYesterday,
        ],
    );

    // Handle "Previous day" button press
    const handlePreviousDayPress = useCallback(() => {
        if (!yesterdayLoaded) {
            // Store current scroll position before loading yesterday
            const currentScrollX = scrollViewRef.current
                ? (scrollViewRef.current as any)._value?.x || 0
                : 0;

            setYesterdayLoaded(true);
            setShowYesterday(true);
            setShowPreviousDayButton(false);

            // Haptic feedback when yesterday loads
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            // Scroll to yesterday's content while maintaining relative position
            setTimeout(() => {
                const slotWidth = 54;
                const yesterdayWidth = 48 * slotWidth;
                // Scroll to middle of yesterday or maintain relative position
                const targetX = Math.min(
                    yesterdayWidth / 2,
                    currentScrollX + yesterdayWidth,
                );

                scrollViewRef.current?.scrollTo({
                    x: targetX,
                    animated: true,
                });
            }, 100);
        }
    }, [yesterdayLoaded, setYesterdayLoaded, setShowYesterday]);

    return {
        scrollViewRef,
        showPreviousDayButton,
        scrollToCurrentTime,
        forceScrollToCurrentTime,
        handleScroll,
        handlePreviousDayPress,
    };
};
