import { COLORS } from "@/shared/constants/COLORS";
import { useNavBarSize } from "@/shared/constants/VIEWPORT";
import { Logger } from "@/shared/utils/errorHandler";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useMemo, useState } from "react";
import {
  Animated,
  PanResponder,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CdDialogHeader, CdDialogHeaderProps } from "./CdDialogHeader";
import { useDialogHeight } from "./useDialogHeight";
interface CdDialogProps {
  visible: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  height?: number; // Height as percentage (0-100), defaults to 50
  maxHeight?: number; // Maximum height as percentage (0-100), defaults to 90
  showCloseButton?: boolean;
  headerProps?: CdDialogHeaderProps;
  enableCloseOnBackgroundPress?: boolean;
  onHeightChange?: (height: number) => void;
  onCollapsedChange?: (isCollapsed: boolean) => void; // Callback when collapsed state changes based on height
  enableDragging?: boolean; // Whether dragging is enabled, defaults to true
  onDoubleTapResize?: (originalHeight: number) => void; // Callback when double tap resize occurs

  // View-based visibility control
  allowedViews?: string[]; // Views where this dialog can appear
  currentView?: string; // Current view ID
  isGlobal?: boolean; // Whether this dialog can appear in any view
  id?: string;
  zIndex?: number;
  collapsed?: boolean;

  // Height persistence
  dialogId?: string; // Dialog ID for persisting height (unique per dialog instance)
  persistHeight?: boolean; // Whether to persist height changes to storage
}

export const CdDialog: React.FC<CdDialogProps> = ({
  visible = false,
  children,
  height = 100,
  maxHeight = 100,
  headerProps,
  onHeightChange,
  onCollapsedChange,
  enableDragging = true,
  onDoubleTapResize,
  allowedViews = [],
  currentView = "",
  isGlobal = false,
  zIndex,
  dialogId,
  persistHeight = false,
}) => {
  const NavBarSize = useNavBarSize();
  const [isDragging, setIsDragging] = useState(false);
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Use custom hook for height management
  const {
    animatedHeight,
    currentHeight,
    originalHeight,
    updateHeight,
    dragStartHeight,
    clampHeight,
  } = useDialogHeight({
    height,
    maxHeight,
    dialogId,
    persistHeight,
    onHeightChange,
    enableDragging,
    screenHeight,
    topInset: insets.top,
    navBarSize: NavBarSize,
  });

  const lastTap = React.useRef<number | null>(null);
  const COLLAPSED_HEIGHT_THRESHOLD = 10; // Height percentage below which dialog is considered collapsed
  const previousCollapsedState = React.useRef<boolean | null>(null);

  // Check if glass effect is available
  const canUseGlassEffect = useMemo(() => {
    // Only available on iOS 18+ (iOS 26 refers to internal version)
    if (Platform.OS !== "ios") return false;
    return isLiquidGlassAvailable();
  }, []);

  // Wrapper to clamp height before updating and notify collapsed state changes
  const updateHeightClamped = useCallback(
    (newHeight: number) => {
      const clampedHeight = clampHeight(newHeight);
      updateHeight(clampedHeight);

      // Check if collapsed state changed and notify parent
      if (onCollapsedChange) {
        const isCollapsed = clampedHeight < COLLAPSED_HEIGHT_THRESHOLD;
        if (previousCollapsedState.current !== isCollapsed) {
          previousCollapsedState.current = isCollapsed;
          onCollapsedChange(isCollapsed);
        }
      }
    },
    [clampHeight, updateHeight, onCollapsedChange]
  );

  // Check if dialog should be visible in current view
  const shouldShowInView =
    isGlobal || allowedViews.length === 0 || allowedViews.includes(currentView);
  const shouldRender = visible && shouldShowInView;

  const handleDoubleTap = useCallback(() => {
    // Medium haptic feedback for double tap
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Resize to original height
    updateHeightClamped(originalHeight.current);
    onDoubleTapResize?.(originalHeight.current);
  }, [updateHeightClamped, onDoubleTapResize, originalHeight]);

  // Create PanResponder for drag gestures (memoized)
  const pullLabel =
    typeof headerProps?.title === "string"
      ? headerProps.title
      : "Dialog pull indicator";

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (_evt) => {
          if (!enableDragging) return false;

          // Check for potential double tap
          const now = Date.now();
          const DOUBLE_PRESS_DELAY = 300;

          if (lastTap.current && now - lastTap.current < DOUBLE_PRESS_DELAY) {
            // This might be a double tap, let's handle it immediately
            handleDoubleTap();
            lastTap.current = null;
            return false; // Don't start pan responder for double tap
          } else {
            // Record this tap for potential double tap detection
            lastTap.current = now;
            return true; // Start pan responder for potential drag
          }
        },
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          return enableDragging && Math.abs(gestureState.dy) > 3;
        },
        onPanResponderGrant: (_evt) => {
          if (!enableDragging) return;

          // Light haptic feedback when drag starts
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setIsDragging(true);
          dragStartHeight.current = currentHeight.current;
        },
        onPanResponderMove: (evt, gestureState) => {
          if (!enableDragging) return;
          // Calculate available height for proper percentage calculation
          const maxAvailablePixels = Math.max(
            0,
            screenHeight - insets.top - NavBarSize
          );
          const heightChangePercent =
            (-gestureState.dy / maxAvailablePixels) * 100;
          const newHeight = dragStartHeight.current + heightChangePercent;
          const clampedHeight = clampHeight(newHeight);

          // Update animated value directly for smooth dragging
          animatedHeight.setValue(clampedHeight);
        },
        onPanResponderRelease: (evt, gestureState) => {
          if (!enableDragging) return;
          // Light haptic feedback when drag ends
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setIsDragging(false);
          // Calculate available height for proper percentage calculation
          const maxAvailablePixels = Math.max(
            0,
            screenHeight - insets.top - NavBarSize
          );
          const heightChangePercent =
            (-gestureState.dy / maxAvailablePixels) * 100;
          const newHeight = dragStartHeight.current + heightChangePercent;
          // Set a maximum height of 90%
          updateHeightClamped(newHeight);
          Logger.logDebug("Dialog height updated", "DYNAMIC_DIALOG_RESIZE", {
            newHeight,
            heightChangePercent,
          });
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [
      enableDragging,
      clampHeight,
      screenHeight,
      handleDoubleTap,
      animatedHeight,
      updateHeightClamped,
      NavBarSize,
      insets.top,
      currentHeight,
      dragStartHeight,
    ]
  );

  if (!shouldRender) return null;

  // Calculate available height for the dialog (between nav bar and top inset)
  const maxAvailablePixels = Math.max(
    0,
    screenHeight - insets.top - NavBarSize
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: NavBarSize,
          height: animatedHeight.interpolate({
            inputRange: [0, 100],
            outputRange: [0, maxAvailablePixels],
            extrapolate: "clamp",
          }),
          zIndex: zIndex ?? 1000,
        },
      ]}
    >
      {/* Pull indicator - positioned above the modal */}
      {enableDragging && (
        <View
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={String(pullLabel)}
          style={[
            styles.pullIndicator,
            isDragging
              ? styles.pullIndicatorDragging
              : styles.pullIndicatorNormal,
          ]}
          {...panResponder.panHandlers}
        >
          <View
            style={[styles.pullHandle, isDragging && styles.pullHandleDragging]}
          />
        </View>
      )}

      {canUseGlassEffect ? (
        <GlassView
          glassEffectStyle="regular"
          isInteractive={true}
          tintColor={COLORS.light.glassTint}
          style={[
            styles.gradientContainer,
            styles.glassContainer,
            enableDragging && styles.gradientContainerWithDragging,
          ]}
        >
          {/* Make the entire top area draggable when header is not present */}
          {!headerProps && enableDragging && (
            <View style={styles.topDragArea} {...panResponder.panHandlers} />
          )}

          {headerProps && (
            <CdDialogHeader
              {...headerProps}
              onTitleDoubleTap={enableDragging ? handleDoubleTap : undefined}
              onTitlePress={() => {
                // Cycle between collapsed -> default -> full-screen
                // collapsed: small header-only height (12%),
                // default: originalHeight.current
                // full: 100% minus safe area (we treat as 100)
                const collapsedHeight = 0;
                const defaultHeight = originalHeight.current || height;
                // Full-screen state should be a maximum of 80% height per spec
                const fullHeight = 100;

                const current = currentHeight.current;
                if (Math.abs(current - collapsedHeight) < 1) {
                  // collapsed -> default
                  updateHeightClamped(defaultHeight);
                } else if (Math.abs(current - defaultHeight) < 1) {
                  // default -> full
                  updateHeightClamped(fullHeight);
                } else {
                  // full -> collapsed
                  updateHeightClamped(collapsedHeight);
                }
              }}
            />
          )}
          <View
            style={[
              styles.content,
              enableDragging && styles.contentWithDragging,
            ]}
          >
            {children}
          </View>
        </GlassView>
      ) : (
        <LinearGradient
          colors={[COLORS.linearGradient.start, COLORS.linearGradient.end]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[
            styles.gradientContainer,
            enableDragging && styles.gradientContainerWithDragging,
          ]}
        >
          {/* Make the entire top area draggable when header is not present */}
          {!headerProps && enableDragging && (
            <View style={styles.topDragArea} {...panResponder.panHandlers} />
          )}

          {headerProps && (
            <CdDialogHeader
              {...headerProps}
              onTitleDoubleTap={enableDragging ? handleDoubleTap : undefined}
              onTitlePress={() => {
                // Cycle between collapsed -> default -> full-screen
                // collapsed: small header-only height (12%),
                // default: originalHeight.current
                // full: 100% minus safe area (we treat as 100)
                const collapsedHeight = 0;
                const defaultHeight = originalHeight.current || height;
                // Full-screen state should be a maximum of 80% height per spec
                const fullHeight = 100;

                const current = currentHeight.current;
                if (Math.abs(current - collapsedHeight) < 1) {
                  // collapsed -> default
                  updateHeightClamped(defaultHeight);
                } else if (Math.abs(current - defaultHeight) < 1) {
                  // default -> full
                  updateHeightClamped(fullHeight);
                } else {
                  // full -> collapsed
                  updateHeightClamped(collapsedHeight);
                }
              }}
            />
          )}
          <View
            style={[
              styles.content,
              enableDragging && styles.contentWithDragging,
            ]}
          >
            {children}
          </View>
        </LinearGradient>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    paddingTop: 0,
    paddingHorizontal: 3,
    zIndex: 1000,
  },
  gradientContainer: {
    flex: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  glassContainer: {
    borderRadius: 20,
    overflow: "hidden",
  },
  gradientContainerWithDragging: {
    marginTop: 10,
  },
  pullIndicator: {
    position: "absolute",
    top: -10, // Position above the modal
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    height: 30,
    zIndex: 20, // Higher z-index to ensure it's above everything
  },
  pullIndicatorDragging: {
    opacity: 1.0,
  },
  pullIndicatorNormal: {
    opacity: 0.8,
  },
  topDragArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 50, // Large drag area at the top
    zIndex: 5,
  },
  pullHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#000",
  },
  pullHandleDragging: {
    width: 50,
    height: 5,
    backgroundColor: "#333",
  },
  content: {
    flex: 1,
    alignSelf: "center",
    paddingVertical: "2%",
    width: "90%",
  },
  contentWithDragging: {
    marginTop: 10,
  },
});
