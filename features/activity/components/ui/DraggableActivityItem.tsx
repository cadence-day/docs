import { DraggableActivityItemProps } from "@/features/activity/types";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import { Animated, PanResponder, TouchableOpacity, View } from "react-native";
import {
  createShakeTransform,
  startShakeAnimation,
  stopShakeAnimation,
} from "../utils/animationUtils";
import {
  calculateGridPositionFromDrag,
  createDefaultGridConfig,
  getGridPosition,
  GRID_CONSTANTS,
} from "../utils/gridUtils";
import { ActivityBox } from "./ActivityBox";

export const DraggableActivityItem: React.FC<DraggableActivityItemProps> = ({
  activity,
  index,
  activityOrder,
  onActivityPress,
  onDragStart,
  onDragEnd,
  onReorder,
  onPlaceholderChange,
  gridConfig,
  containerWidth,
  isShakeMode,
  draggedActivityId,
  dragPlaceholderIndex,
  onDeleteActivity,
}) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const dragAnimation = useRef(new Animated.ValueXY()).current;
  const lastUpdateTimeRef = useRef(0);

  const isBeingDragged = draggedActivityId === activity.id;
  const resolvedGridConfig = createDefaultGridConfig(gridConfig || {});
  const columns = resolvedGridConfig.columns;
  const position = getGridPosition(index, columns);
  const itemWidth = `${100 / columns}%`;

  // Calculate array index - this will be used for actual reordering operations
  const arrayIndex = activityOrder.findIndex((a) => a.id === activity.id);

  // Initialize shake animation when entering shake mode
  useEffect(() => {
    if (isShakeMode && !isBeingDragged) {
      const delay = index * 15 + Math.random() * 25; // Staggered animation start
      startShakeAnimation(shakeAnim, rotationAnim, delay);
    } else if (!isShakeMode) {
      stopShakeAnimation(shakeAnim, rotationAnim);
    }

    return () => {
      stopShakeAnimation(shakeAnim, rotationAnim);
    };
  }, [isShakeMode, isBeingDragged, index]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
    },
    onPanResponderGrant: () => {
      if (activity.id) {
        onDragStart(activity.id);
      }
      onPlaceholderChange(null);

      // Stop shake animation for dragged item
      stopShakeAnimation(shakeAnim, rotationAnim);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    onPanResponderMove: (evt, gestureState) => {
      // Update drag animation smoothly
      dragAnimation.setValue({ x: gestureState.dx, y: gestureState.dy });

      // Only update placeholder position if dragged far enough to avoid jitter
      if (Math.abs(gestureState.dx) > 20 || Math.abs(gestureState.dy) > 20) {
        if (arrayIndex !== -1) {
          // Use the visual index for drag calculations
          // The total grid size should include all positions including the "Add Activity" button if present
          const totalGridPositions =
            activityOrder.length + (index > arrayIndex ? 1 : 0);

          const newVisualIndex = calculateGridPositionFromDrag(
            gestureState.dx,
            gestureState.dy,
            index, // Use visual index
            containerWidth,
            resolvedGridConfig,
            totalGridPositions
          );

          // Throttle placeholder updates to reduce jitter
          const now = Date.now();
          if (
            newVisualIndex !== index &&
            newVisualIndex !== dragPlaceholderIndex &&
            now - lastUpdateTimeRef.current > 100
          ) {
            onPlaceholderChange(newVisualIndex);
            lastUpdateTimeRef.current = now;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      const wasBeingDragged = draggedActivityId === activity.id;
      onDragEnd();
      onPlaceholderChange(null);

      // Restart shake animation for the item that was being dragged
      if (wasBeingDragged && isShakeMode) {
        startShakeAnimation(shakeAnim, rotationAnim);
      }

      // Apply reordering if position changed
      if (arrayIndex !== -1) {
        // Use the visual index for drag calculations
        // The total grid size should include all positions including the "Add Activity" button if present
        const totalGridPositions =
          activityOrder.length + (index > arrayIndex ? 1 : 0);

        const newVisualIndex = calculateGridPositionFromDrag(
          gestureState.dx,
          gestureState.dy,
          index, // Use visual index
          containerWidth,
          resolvedGridConfig,
          totalGridPositions
        );

        // Convert visual index back to array index for reordering
        // If there's an offset (Add Activity button), subtract 1 from positions > 0
        const newArrayIndex =
          index > arrayIndex ? Math.max(0, newVisualIndex - 1) : newVisualIndex;

        if (
          newArrayIndex !== arrayIndex &&
          newArrayIndex < activityOrder.length
        ) {
          onReorder(arrayIndex, newArrayIndex);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      }

      // Smooth reset animation
      Animated.spring(dragAnimation, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
        tension: 300,
        friction: 10,
        velocity: { x: 0, y: 0 },
      }).start();
    },
  });

  return (
    <View
      style={{
        position: "absolute",
        top:
          position.row * (GRID_CONSTANTS.ITEM_HEIGHT + GRID_CONSTANTS.GRID_GAP),
        left: `${position.col * (100 / columns)}%`,
        width: itemWidth as any,
        height: GRID_CONSTANTS.ITEM_HEIGHT,
        opacity: isBeingDragged ? 0.1 : 1,
        zIndex: isBeingDragged ? 1000 : 10,
      }}
    >
      <Animated.View
        style={{
          flex: 1,
          transform: isBeingDragged
            ? []
            : createShakeTransform(shakeAnim, rotationAnim),
        }}
      >
        <Animated.View
          {...panResponder.panHandlers}
          style={{
            flex: 1,
            transform: isBeingDragged
              ? [...dragAnimation.getTranslateTransform(), { scale: 1.1 }]
              : [],
            opacity: isBeingDragged ? 1 : 1,
            zIndex: isBeingDragged ? 2000 : 1,
            elevation: isBeingDragged ? 10 : 0,
            shadowColor: isBeingDragged ? "#000" : "transparent",
            shadowOffset: isBeingDragged
              ? { width: 0, height: 8 }
              : { width: 0, height: 0 },
            shadowOpacity: isBeingDragged ? 0.4 : 0,
            shadowRadius: isBeingDragged ? 12 : 0,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityBox
            activity={activity}
            onPress={() => onActivityPress(activity)}
            boxWidth="100%"
            style={{ paddingHorizontal: 4 }}
          />
        </Animated.View>
      </Animated.View>

      {/* Delete button */}
      {isShakeMode && (
        <Animated.View
          style={{
            position: "absolute",
            top: -8,
            left: -8,
            zIndex: 1001,
            transform: isBeingDragged
              ? [...dragAnimation.getTranslateTransform(), { scale: 1.05 }]
              : [],
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              width: 20,
              height: 20,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#ddd",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
              elevation: 3,
            }}
            onPress={() => activity.id && onDeleteActivity(activity.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="remove" size={10} color="#000" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};
