import { useActivityDialogHeightStore } from "@/features/activity/stores";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

interface UseDialogHeightProps {
    height: number;
    maxHeight?: number;
    dialogId?: string;
    persistHeight?: boolean;
    onHeightChange?: (height: number) => void;
    enableDragging?: boolean;
    screenHeight: number;
    topInset: number;
    navBarSize: number;
}

interface UseDialogHeightReturn {
    animatedHeight: Animated.Value;
    currentHeight: React.MutableRefObject<number>;
    originalHeight: React.MutableRefObject<number>;
    updateHeight: (newHeight: number, shouldPersist?: boolean) => void;
    dragStartHeight: React.MutableRefObject<number>;
    clampHeight: (newHeight: number) => number;
}
export const useDialogHeight = ({
    height,
    maxHeight = 100,
    dialogId,
    persistHeight = false,
    onHeightChange,
    enableDragging = true,
    screenHeight,
    topInset,
    navBarSize,
}: UseDialogHeightProps): UseDialogHeightReturn => {
    const { getDialogHeight, setDialogHeight: saveDialogHeight } =
        useActivityDialogHeightStore();

    // Clamp height to valid range
    const clampHeight = useCallback(
        (newHeight: number) => {
            const headerHeight = 35; // Height of DialogHeader in pixels
            const pullIndicatorHeight = enableDragging ? 30 : 0; // Height of pull indicator
            const minHeightRequired = headerHeight + pullIndicatorHeight;

            // Calculate available height between nav bar and safe area top inset
            const maxAvailablePixels = Math.max(
                0,
                screenHeight - topInset - navBarSize,
            );

            // Now treat newHeight as a percentage of maxAvailablePixels, not screenHeight
            // So 100% means full height between nav bar and top inset
            const minHeightPercent = (minHeightRequired / maxAvailablePixels) *
                100;
            const effectiveMax = Math.min(maxHeight, 100);

            return Math.max(
                minHeightPercent,
                Math.min(effectiveMax, newHeight),
            );
        },
        [enableDragging, screenHeight, maxHeight, topInset, navBarSize],
    );

    // Determine the height to use: persisted or prop
    const [effectiveHeight] = useState(() => {
        if (persistHeight && dialogId) {
            const savedHeight = getDialogHeight(dialogId);
            GlobalErrorHandler.logDebug(
                "Checking for persisted dialog height",
                "DIALOG_HEIGHT_PERSISTENCE",
                {
                    dialogId,
                    savedHeight,
                    propHeight: height,
                    persistHeight,
                    allHeights: useActivityDialogHeightStore.getState().dialogHeights,
                },
            );
            if (savedHeight !== null) {
                const clamped = clampHeight(savedHeight);
                GlobalErrorHandler.logDebug(
                    "Loading persisted dialog height",
                    "DIALOG_HEIGHT_PERSISTENCE",
                    { dialogId, savedHeight, clamped, propHeight: height },
                );
                return clamped;
            }
        }
        const clamped = clampHeight(height);
        GlobalErrorHandler.logDebug(
            "Using prop height (no persisted height found)",
            "DIALOG_HEIGHT_PERSISTENCE",
            { dialogId, propHeight: height, clamped, persistHeight },
        );
        return clamped;
    });

    const animatedHeight = useRef(new Animated.Value(effectiveHeight)).current;
    const currentHeight = useRef(effectiveHeight);
    const originalHeight = useRef(effectiveHeight);
    const dragStartHeight = useRef(effectiveHeight);

    // Update height function
    const updateHeight = useCallback(
        (newHeight: number, shouldPersist: boolean = true) => {
            currentHeight.current = newHeight;

            Animated.spring(animatedHeight, {
                toValue: newHeight,
                damping: 15,
                stiffness: 150,
                mass: 1,
                useNativeDriver: false,
            }).start();

            onHeightChange?.(newHeight);

            // Persist height if enabled
            if (persistHeight && dialogId && shouldPersist) {
                try {
                    saveDialogHeight(dialogId, newHeight);
                    GlobalErrorHandler.logDebug(
                        "Persisted dialog height",
                        "DIALOG_HEIGHT_PERSISTENCE",
                        {
                            dialogId,
                            newHeight,
                            allHeights: useActivityDialogHeightStore.getState().dialogHeights,
                        },
                    );
                } catch (error) {
                    GlobalErrorHandler.logError(error, "persistDialogHeight", {
                        dialogId,
                        newHeight,
                    });
                }
            }
        },
        [
            animatedHeight,
            onHeightChange,
            persistHeight,
            dialogId,
            saveDialogHeight,
        ],
    );

    // Handle prop changes - only update if not persisting or if saved height matches prop
    useEffect(() => {
        if (persistHeight && dialogId) {
            const savedHeight = getDialogHeight(dialogId);
            // Only update from prop if there's no saved height
            // If saved height exists, it takes priority over prop changes
            if (savedHeight === null) {
                const clampedHeight = clampHeight(height);
                updateHeight(clampedHeight, false); // Don't persist when setting from prop
                originalHeight.current = clampedHeight;
            } else {
                // Saved height exists - ignore prop changes completely
                GlobalErrorHandler.logDebug(
                    "Ignoring prop height change - using persisted height",
                    "DIALOG_HEIGHT_PERSISTENCE",
                    { dialogId, propHeight: height, savedHeight },
                );
            }
        } else {
            // Not persisting, just use the prop
            const clampedHeight = clampHeight(height);
            updateHeight(clampedHeight, false);
            originalHeight.current = clampedHeight;
        }
    }, [
        height,
        persistHeight,
        dialogId,
        getDialogHeight,
        updateHeight,
        clampHeight,
    ]);

    return {
        animatedHeight,
        currentHeight,
        originalHeight,
        updateHeight,
        dragStartHeight,
        clampHeight,
    };
};
