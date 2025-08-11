import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React, { useState, useRef, useCallback } from "react";
import {
  StyleSheet,
  View,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import DialogHeader, { type DialogHeaderProps } from "./DialogHeader";
import { NAV_BAR_SIZE } from "../../constants/VIEWPORT";

interface DynamicDialogProps {
  visible: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  height?: number; // Height as percentage (0-100), defaults to 50
  maxHeight?: number; // Maximum height as percentage (0-100), defaults to 90
  showCloseButton?: boolean;
  headerProps?: DialogHeaderProps;
  enableCloseOnBackgroundPress?: boolean;
  onHeightChange?: (height: number) => void;
  enableDragging?: boolean; // Whether dragging is enabled, defaults to true
  onDoubleTapResize?: (originalHeight: number) => void; // Callback when double tap resize occurs

  // View-based visibility control
  allowedViews?: string[]; // Views where this dialog can appear
  currentView?: string; // Current view ID
  isGlobal?: boolean; // Whether this dialog can appear in any view
}

const DynamicDialog: React.FC<DynamicDialogProps> = ({
  visible = false,
  onClose,
  children,
  height = 85,
  maxHeight = 85,
  showCloseButton = true,
  headerProps,
  enableCloseOnBackgroundPress = true,
  onHeightChange,
  enableDragging = true,
  onDoubleTapResize,
  allowedViews = [],
  currentView = "",
  isGlobal = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const animatedHeight = useRef(new Animated.Value(height)).current;
  const dragStartHeight = useRef(0);
  const currentHeight = useRef(height);
  const originalHeight = useRef(height); // Store original height
  const lastTap = useRef<number | null>(null);

  // Check if dialog should be visible in current view
  const shouldShowInView =
    isGlobal || allowedViews.length === 0 || allowedViews.includes(currentView);
  const shouldRender = visible && shouldShowInView;

  // Update height when prop changes
  React.useEffect(() => {
    originalHeight.current = height; // Update original height when prop changes
    currentHeight.current = height;
    Animated.timing(animatedHeight, {
      toValue: height,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [height, animatedHeight]);

  const clampHeight = useCallback(
    (newHeight: number) => {
      const screenHeight = Dimensions.get("window").height;
      const headerHeight = 50; // Height of DialogHeader in pixels
      const pullIndicatorHeight = enableDragging ? 30 : 0; // Height of pull indicator
      const minHeightRequired = headerHeight + pullIndicatorHeight;
      const minHeightPercent = (minHeightRequired / screenHeight) * 100;
      return Math.max(minHeightPercent, Math.min(maxHeight, newHeight));
    },
    [enableDragging]
  );

  const updateHeight = useCallback(
    (newHeight: number) => {
      const clampedHeight = clampHeight(newHeight);
      currentHeight.current = clampedHeight;

      Animated.spring(animatedHeight, {
        toValue: clampedHeight,
        damping: 15,
        stiffness: 150,
        mass: 1,
        useNativeDriver: false,
      }).start();

      onHeightChange?.(clampedHeight);
    },
    [clampHeight, onHeightChange, animatedHeight]
  );

  // Create PanResponder for drag gestures
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
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
    onPanResponderGrant: (evt) => {
      if (!enableDragging) return;

      // Light haptic feedback when drag starts
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsDragging(true);
      dragStartHeight.current = currentHeight.current;
    },
    onPanResponderMove: (evt, gestureState) => {
      if (!enableDragging) return;
      const screenHeight = Dimensions.get("window").height;
      const heightChangePercent = (-gestureState.dy / screenHeight) * 100;
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
      const screenHeight = Dimensions.get("window").height;
      const heightChangePercent = (-gestureState.dy / screenHeight) * 100;
      const newHeight = dragStartHeight.current + heightChangePercent;
      // Set a maximum height of 90%
      updateHeight(newHeight);
      console.log("Dialog height updated to:", newHeight);
    },
    onPanResponderTerminationRequest: () => false,
  });

  const handleDoubleTap = useCallback(() => {
    // Medium haptic feedback for double tap
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Resize to original height
    updateHeight(originalHeight.current);
    onDoubleTapResize?.(originalHeight.current);
  }, [updateHeight, onDoubleTapResize]);

  if (!shouldRender) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: animatedHeight.interpolate({
            inputRange: [0, 100],
            outputRange: ["0%", "100%"],
            extrapolate: "clamp",
          }),
        },
      ]}>
      {/* Pull indicator - positioned above the modal */}
      {enableDragging && (
        <View
          style={[
            styles.pullIndicator,
            {
              opacity: isDragging ? 1.0 : 0.8,
            },
          ]}
          {...panResponder.panHandlers}>
          <View
            style={[
              styles.pullHandle,
              {
                backgroundColor: isDragging ? "#333" : "#000",
                width: isDragging ? 50 : 40,
                height: isDragging ? 5 : 4,
              },
            ]}
          />
        </View>
      )}

      <LinearGradient
        colors={["#151414", "#4A4747"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          flex: 1,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          marginTop: enableDragging ? 10 : 0, // Only add space for pull handle when dragging is enabled
        }}>
        {/* Make the entire top area draggable when header is not present */}
        {!headerProps && enableDragging && (
          <View style={styles.topDragArea} {...panResponder.panHandlers} />
        )}

        {headerProps && (
          <DialogHeader
            {...headerProps}
            onTitleDoubleTap={enableDragging ? handleDoubleTap : undefined}
          />
        )}
        <View style={[styles.content, { marginTop: enableDragging ? 10 : 0 }]}>
          {children}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: NAV_BAR_SIZE,
    left: 0,
    right: 0,
    overflow: "hidden",
    paddingTop: 0,
    paddingHorizontal: 3,
    zIndex: 1000,
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
    backgroundColor: "#666",
    borderRadius: 2,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  closeButtonLine: {
    position: "absolute",
    width: 20,
    height: 2,
    backgroundColor: "#666",
    borderRadius: 1,
  },
  closeButtonLineRotated: {
    transform: [{ rotate: "45deg" }],
  },
  content: {
    flex: 1,
    alignSelf: "center",
    paddingVertical: 20,
    width: "100%",
  },
});

export default DynamicDialog;
